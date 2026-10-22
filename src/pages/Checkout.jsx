import { useEffect, useMemo, useRef, useState } from "react";
import { useLang } from "../lang-context.js";
import { SITE, formatPrice } from "../data/site.js";
import { waLink } from "../whatsapp.js";
import {
  callFunction,
  fetchDeliveryZones,
  getPublicOrder,
  placeOnlineOrder,
  supabaseConfigured,
} from "../supabase.js";
import { clearCart, getCart, removeFromCart, setCartQty, subscribeToCart } from "../cart.js";
import { IconCart, IconChat, IconCheck, IconMinus, IconPlus } from "../components/Icons.jsx";

// Online payment methods offered at checkout. "cash" always works; "mtn" and
// "orange" appear once the matching Edge Function secrets are configured.
const METHODS = Array.from(
  new Set(
    (import.meta.env.VITE_PAYMENT_METHODS ?? "cash")
      .split(",")
      .map((method) => method.trim())
      .filter((method) => ["cash", "mtn", "orange"].includes(method))
  )
);
if (METHODS.length === 0) METHODS.push("cash");

const POLL_INTERVAL_MS = 5000;
const POLL_MAX_ATTEMPTS = 36; // ~3 minutes
const LAST_ORDER_KEY = "mgh-last-order";
const LAST_ORDER_MAX_AGE_MS = 3 * 60 * 60 * 1000;

/**
 * Resume context, read once at mount: either the Orange Money redirect
 * (?order=…&payment=orange) or the last placed order kept in localStorage
 * for three hours (lets a refresh keep the confirmation screen).
 */
function readResume() {
  try {
    const params = new URLSearchParams(window.location.search);
    const resumeId = params.get("order");
    if (resumeId && params.get("payment") === "orange") {
      return {
        orderId: resumeId,
        method: "orange",
        phase: "pending-orange",
        cancelled: params.get("state") === "cancel",
        total: null,
      };
    }
    const last = JSON.parse(localStorage.getItem(LAST_ORDER_KEY) ?? "null");
    if (last && Date.now() - last.ts < LAST_ORDER_MAX_AGE_MS && getCart().length === 0) {
      return {
        orderId: last.order_id,
        method: last.method,
        phase: last.method === "cash" ? "placed-cash" : `pending-${last.method}`,
        cancelled: false,
        total: last.total_fcfa ?? null,
      };
    }
  } catch {
    // Corrupted storage or unavailable window: fall back to the form.
  }
  return null;
}

function Field({ id, label, error, hint, children }) {
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      {children}
      {hint ? <p className="field-hint">{hint}</p> : null}
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function CartLine({ line }) {
  const { lang, t } = useLang();
  return (
    <li className="cart-line">
      <div className="cart-line-info">
        <p className="cart-line-name">{line.name[lang]}</p>
        <p className="cart-line-price">{formatPrice(line.price)}</p>
      </div>
      <div className="qty-controls">
        <button
          type="button"
          className="qty-btn"
          aria-label={t("cart.remove")}
          onClick={() => setCartQty(line.type, line.slug, line.qty - 1)}
        >
          <IconMinus size={14} />
        </button>
        <span className="qty-value">{line.qty}</span>
        <button
          type="button"
          className="qty-btn"
          aria-label={t("cart.add")}
          onClick={() => setCartQty(line.type, line.slug, line.qty + 1)}
        >
          <IconPlus size={14} />
        </button>
        <button
          type="button"
          className="cart-line-remove"
          aria-label={t("cart.clear")}
          onClick={() => removeFromCart(line.type, line.slug)}
        >
          ×
        </button>
      </div>
    </li>
  );
}

function PaymentOption({ value, title, hint, checked, onChange }) {
  return (
    <label className={checked ? "payment-option checked" : "payment-option"}>
      <input
        type="radio"
        name="payment"
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
      />
      <span className="payment-option-content">
        <span className="payment-option-title">{title}</span>
        <span className="payment-option-hint">{hint}</span>
      </span>
      {checked ? <span className="payment-option-check"><IconCheck size={16} /></span> : null}
    </label>
  );
}

export default function Checkout() {
  const { lang, t, path } = useLang();
  const [resume] = useState(readResume);
  const [cart, setCart] = useState(getCart);
  const [zones, setZones] = useState([]);
  const [zonesError, setZonesError] = useState(false);
  const [values, setValues] = useState({ name: "", phone: "", momo: "", address: "", note: "", zoneId: "" });
  const [errors, setErrors] = useState({});
  const [phase, setPhase] = useState(() => (resume ? (resume.cancelled ? "failed" : resume.phase) : "form"));
  const [order, setOrder] = useState(() =>
    resume ? { order_id: resume.orderId, total_fcfa: resume.total } : null
  );
  const [payment, setPayment] = useState(() => resume?.method ?? METHODS[0]);
  const [submitError, setSubmitError] = useState(null);
  const [liveStatus, setLiveStatus] = useState(null);
  const formRef = useRef(null);

  const configured = supabaseConfigured();

  // Cart updates while filling the form.
  useEffect(() => subscribeToCart(() => setCart(getCart())), []);

  // Delivery zones from the database (managed in the back-office).
  useEffect(() => {
    if (!configured) return;
    fetchDeliveryZones()
      .then((rows) => {
        setZones(rows);
        setValues((current) => ({ ...current, zoneId: current.zoneId || (rows[0]?.id ?? "") }));
      })
      .catch(() => setZonesError(true));
  }, [configured]);

  const cartTotal = useMemo(() => cart.reduce((sum, line) => sum + line.price * line.qty, 0), [cart]);
  const zone = zones.find((z) => z.id === values.zoneId);
  const grandTotal = cartTotal + (zone?.fee_fcfa ?? 0);

  const update = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
  };

  const validate = () => {
    const next = {};
    if (values.name.trim().length < 2) next.name = t("contact.form.nameError");
    const digits = values.phone.replace(/[\s.-]/g, "").replace(/^\+/, "");
    if (!/^\d{8,15}$/.test(digits)) next.phone = t("contact.form.phoneError");
    if (!values.zoneId) next.zoneId = t("checkout.zoneError");
    if (values.address.trim().length < 2) next.address = t("checkout.addressError");
    if (payment === "mtn") {
      const momo = values.momo.replace(/[\s.-]/g, "").replace(/^\+/, "");
      if (!/^(237)?6\d{8}$/.test(momo)) next.momo = t("checkout.momoError");
    }
    return next;
  };

  const rememberOrder = (orderId, method, total) => {
    try {
      localStorage.setItem(
        LAST_ORDER_KEY,
        JSON.stringify({ order_id: orderId, method, total_fcfa: total, ts: Date.now() })
      );
    } catch {
      // Storage may be unavailable in private browsing — non-blocking.
    }
  };

  const startPayment = async (placedOrder, method) => {
    if (method === "mtn") {
      const momo = values.momo.replace(/[\s.-]/g, "").replace(/^\+/, "");
      await callFunction("payments-mtn-create", { order_id: placedOrder.order_id, phone: momo });
      setPhase("pending-mtn");
    } else if (method === "orange") {
      const result = await callFunction("payments-orange-create", {
        order_id: placedOrder.order_id,
        lang,
        origin: window.location.origin,
      });
      if (result.payment_url) {
        window.location.assign(result.payment_url);
      } else {
        setPhase("pending-orange");
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      const firstKey = ["name", "phone", "zoneId", "address", "momo"].find((key) => nextErrors[key]);
      formRef.current?.querySelector(`#${firstKey}`)?.focus();
      return;
    }

    setSubmitError(null);
    setPhase("placing");
    try {
      const items = cart.map((line) => ({ type: line.type, slug: line.slug, qty: line.qty }));
      const placed = await placeOnlineOrder({
        name: values.name.trim(),
        phone: values.phone.trim(),
        items,
        zoneId: values.zoneId,
        location: values.address.trim(),
        note: values.note.trim(),
        paymentMethod: payment,
      });
      setOrder(placed);
      rememberOrder(placed.order_id, payment, placed.total_fcfa);
      clearCart();

      if (payment === "cash") {
        setPhase("placed-cash");
        callFunction("notify-order", { order_id: placed.order_id }).catch(() => {});
      } else {
        // The order is recorded at this point: a failure to START the
        // payment must show the retry screen, not the (now empty) form.
        try {
          await startPayment(placed, payment);
        } catch (error) {
          console.error(error);
          setSubmitError(t("checkout.errorGeneric"));
          setPhase("failed");
        }
      }
    } catch (error) {
      console.error(error);
      setSubmitError(error.message?.includes("Trop de commandes") ? t("checkout.spamError") : t("checkout.errorGeneric"));
      setPhase("form");
    }
  };

  const retryPayment = async () => {
    if (!order) return;
    setSubmitError(null);
    try {
      await startPayment({ order_id: order.order_id }, payment);
    } catch (error) {
      console.error(error);
      setSubmitError(t("checkout.errorGeneric"));
      setPhase("failed");
    }
  };

  // Poll the payment status while the customer confirms on their handset
  // (MTN) or comes back from the Orange payment page.
  useEffect(() => {
    if ((phase !== "pending-mtn" && phase !== "pending-orange") || !order) return;
    let attempts = 0;
    let stopped = false;

    const check = async () => {
      attempts += 1;
      try {
        const fn = phase === "pending-mtn" ? "payments-mtn-check" : "payments-orange-check";
        const result = await callFunction(fn, { order_id: order.order_id });
        if (stopped) return;
        if (result.payment_status === "paid") {
          setPhase("paid");
          return;
        }
        if (result.payment_status === "failed") {
          setPhase("failed");
          return;
        }
      } catch {
        // Transient errors keep polling until the attempt budget is spent.
      }
      if (attempts >= POLL_MAX_ATTEMPTS && !stopped) {
        setPhase("timeout");
      }
    };

    check();
    const interval = setInterval(check, POLL_INTERVAL_MS);
    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }, [phase, order]);

  // Live delivery tracking on the confirmation screen (the manager advances
  // the workflow from the back-office; the customer sees it move).
  useEffect(() => {
    if (!order || (phase !== "placed-cash" && phase !== "paid")) return;
    let stopped = false;
    const refresh = async () => {
      try {
        const result = await getPublicOrder(order.order_id);
        if (!stopped && result) setLiveStatus(result);
      } catch {
        // Transient errors are ignored; the next tick retries.
      }
    };
    refresh();
    const interval = setInterval(refresh, 15000);
    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }, [order, phase]);

  const whatsappFollowUp = () => {
    const short = order ? order.order_id.slice(0, 8).toUpperCase() : "";
    const message =
      lang === "fr"
        ? `Bonjour Mialine Gifted Hands ! Je viens de passer la commande n° ${short} sur le site.`
        : `Hello Mialine Gifted Hands! I just placed order no. ${short} on the website.`;
    return waLink(SITE.whatsapp[0].number, message);
  };

  // ── Offline notice ───────────────────────────────────────────────────
  if (!configured) {
    return (
      <div className="page-checkout">
        <section className="checkout-section">
          <div className="container narrow">
            <div className="pay-status">
              <h2>{t("checkout.title")}</h2>
              <p>{t("checkout.offlineText")}</p>
              <div className="pay-status-actions">
                <a
                  href={waLink(SITE.whatsapp[0].number, t("hero.waMessage"))}
                  className="btn btn-whatsapp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <IconChat size={18} />
                  {t("contact.form.submit")}
                </a>
                <a className="btn btn-outline" href={path("menu")}>
                  {t("checkout.viewMenu")}
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // ── Status screens (after the order is placed) ──────────────────────
  if (phase !== "form" && phase !== "placing" && order) {
    const shortId = order.order_id.slice(0, 8).toUpperCase();
    const total = order.total_fcfa;

    let icon = <IconCart size={28} />;
    let title = t("checkout.statusTitle");
    let text = null;
    let actions = (
      <a className="btn btn-outline" href={whatsappFollowUp()} target="_blank" rel="noopener noreferrer">
        <IconChat size={18} />
        {t("checkout.whatsappFallback")}
      </a>
    );

    if (phase === "placed-cash") {
      icon = <IconCheck size={28} />;
      title = t("checkout.cashTitle");
      text = t("checkout.cashText");
    } else if (phase === "pending-mtn") {
      title = t("checkout.mtnPendingTitle");
      text = t("checkout.mtnPendingText");
      actions = (
        <p className="pay-status-waiting">{t("checkout.checking")}</p>
      );
    } else if (phase === "pending-orange") {
      title = t("checkout.orangePendingTitle");
      text = t("checkout.orangePendingText");
      actions = (
        <p className="pay-status-waiting">{t("checkout.checking")}</p>
      );
    } else if (phase === "paid") {
      icon = <IconCheck size={28} />;
      title = t("checkout.paidTitle");
      text = t("checkout.paidText");
    } else if (phase === "failed") {
      title = t("checkout.failedTitle");
      text = t("checkout.failedText");
      actions = (
        <div className="pay-status-actions">
          {payment !== "cash" ? (
            <button type="button" className="btn btn-accent" onClick={retryPayment}>
              {t("checkout.retry")}
            </button>
          ) : null}
          <a className="btn btn-outline" href={whatsappFollowUp()} target="_blank" rel="noopener noreferrer">
            <IconChat size={18} />
            {t("checkout.whatsappFallback")}
          </a>
        </div>
      );
    } else if (phase === "timeout") {
      title = t("checkout.timeoutTitle");
      text = t("checkout.timeoutText");
      actions = (
        <div className="pay-status-actions">
          <button type="button" className="btn btn-accent" onClick={retryPayment}>
            {t("checkout.retry")}
          </button>
          <a className="btn btn-outline" href={whatsappFollowUp()} target="_blank" rel="noopener noreferrer">
            <IconChat size={18} />
            {t("checkout.whatsappFallback")}
          </a>
        </div>
      );
    }

    return (
      <div className="page-checkout">
        <section className="checkout-section">
          <div className="container narrow">
            <div className={phase === "paid" || phase === "placed-cash" ? "pay-status success" : "pay-status"}>
              <span className="pay-status-icon">{icon}</span>
              <h2>{title}</h2>
              {text ? <p>{text}</p> : null}
              {submitError ? (
                <p className="form-error" role="alert">
                  {submitError}
                </p>
              ) : null}
              <p className="pay-status-order">
                {t("checkout.orderNumber")} <strong>{shortId}</strong>
                {total != null ? <> — {formatPrice(total)}</> : null}
              </p>
              {liveStatus ? (
                <p className="pay-status-track">
                  {t("checkout.trackLabel")} <strong>{t(`checkout.status.${liveStatus.status}`)}</strong>
                </p>
              ) : null}
              {actions}
            </div>
          </div>
        </section>
      </div>
    );
  }

  // ── Empty cart ──────────────────────────────────────────────────────
  if (cart.length === 0) {
    return (
      <div className="page-checkout">
        <section className="checkout-section">
          <div className="container narrow">
            <div className="checkout-empty">
              <IconCart size={32} />
              <h2>{t("checkout.title")}</h2>
              <p>{t("cart.empty")}</p>
              <a className="btn btn-accent" href={path("menu")}>
                {t("cart.browse")}
              </a>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // ── Form ────────────────────────────────────────────────────────────
  return (
    <div className="page-checkout">
      <header className="page-hero">
        <h1>{t("checkout.title")}</h1>
        <p>{t("checkout.tagline")}</p>
      </header>

      <section className="checkout-section">
        <div className="container">
          <div className="checkout-grid">
            <form ref={formRef} className="checkout-main order-form" onSubmit={handleSubmit} noValidate>
              <h2>{t("checkout.formTitle")}</h2>

              <Field id="name" label={t("contact.form.name")} error={errors.name}>
                <input
                  id="name"
                  type="text"
                  value={values.name}
                  onChange={update("name")}
                  autoComplete="name"
                />
              </Field>

              <Field id="phone" label={t("contact.form.phone")} error={errors.phone}>
                <input
                  id="phone"
                  type="tel"
                  value={values.phone}
                  onChange={update("phone")}
                  autoComplete="tel"
                  inputMode="tel"
                />
              </Field>

              <Field id="zoneId" label={t("checkout.zone")} error={errors.zoneId}>
                <select id="zoneId" value={values.zoneId} onChange={update("zoneId")}>
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {lang === "fr" ? z.name_fr : z.name_en} —{" "}
                      {z.fee_fcfa === 0 ? t("contact.deliveryFree") : formatPrice(z.fee_fcfa)}
                    </option>
                  ))}
                </select>
              </Field>

              <Field id="address" label={t("checkout.address")} error={errors.address}>
                <input
                  id="address"
                  type="text"
                  value={values.address}
                  onChange={update("address")}
                  autoComplete="street-address"
                />
              </Field>

              <Field id="note" label={t("checkout.note")}>
                <textarea id="note" rows="2" value={values.note} onChange={update("note")} />
              </Field>

              <fieldset className="payment-methods">
                <legend>{t("checkout.paymentTitle")}</legend>
                {METHODS.includes("cash") ? (
                  <PaymentOption
                    value="cash"
                    title={t("checkout.paymentCash")}
                    hint={t("checkout.paymentCashHint")}
                    checked={payment === "cash"}
                    onChange={setPayment}
                  />
                ) : null}
                {METHODS.includes("mtn") ? (
                  <PaymentOption
                    value="mtn"
                    title={t("checkout.paymentMtn")}
                    hint={t("checkout.paymentMtnHint")}
                    checked={payment === "mtn"}
                    onChange={setPayment}
                  />
                ) : null}
                {METHODS.includes("orange") ? (
                  <PaymentOption
                    value="orange"
                    title={t("checkout.paymentOrange")}
                    hint={t("checkout.paymentOrangeHint")}
                    checked={payment === "orange"}
                    onChange={setPayment}
                  />
                ) : null}
              </fieldset>

              {payment === "mtn" ? (
                <Field id="momo" label={t("checkout.momoNumber")} error={errors.momo} hint={t("checkout.momoHint")}>
                  <input
                    id="momo"
                    type="tel"
                    value={values.momo}
                    onChange={update("momo")}
                    inputMode="tel"
                    placeholder="6 XX XX XX XX"
                    autoComplete="off"
                  />
                </Field>
              ) : null}

              {zonesError ? <p className="form-error" role="alert">{t("checkout.zonesError")}</p> : null}
              {submitError ? (
                <p className="form-error" role="alert">
                  {submitError}
                </p>
              ) : null}

              <button type="submit" className="btn btn-accent btn-block" disabled={phase === "placing"}>
                {phase === "placing" ? t("checkout.submitting") : t("checkout.submit")}
              </button>
            </form>

            <aside className="checkout-aside">
              <h2>{t("checkout.reviewTitle")}</h2>
              <ul className="cart-lines">
                {cart.map((line) => (
                  <CartLine key={`${line.type}-${line.slug}`} line={line} />
                ))}
              </ul>
              <div className="order-summary">
                <p className="summary-row">
                  <span>{t("cart.subtotal")}</span>
                  <span>{formatPrice(cartTotal)}</span>
                </p>
                <p className="summary-row">
                  <span>{t("checkout.deliveryFee")}</span>
                  <span>{zone ? (zone.fee_fcfa === 0 ? t("contact.deliveryFree") : formatPrice(zone.fee_fcfa)) : "—"}</span>
                </p>
                <p className="summary-row summary-total">
                  <span>{t("checkout.total")}</span>
                  <span>{formatPrice(grandTotal)}</span>
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
