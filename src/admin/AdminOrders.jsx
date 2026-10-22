import { useCallback, useEffect, useRef, useState } from "react";
import { useLang } from "../lang-context.js";
import { formatPrice } from "../data/site.js";
import { api } from "./api.js";
import { IconChat, IconPhone } from "../components/Icons.jsx";

const POLL_MS = 15000;

const NEXT_STATUS = {
  new: "confirmed",
  confirmed: "preparing",
  preparing: "delivering",
  delivering: "delivered",
};

const ACTIVE_STATUSES = ["new", "contacted", "confirmed", "preparing", "delivering"];

/** Short double beep through the Web Audio API (no asset needed). */
function playBeep() {
  try {
    const AudioCtx = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    for (const [index, when] of [0, 0.28].entries()) {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = index === 0 ? 880 : 1175;
      gain.gain.setValueAtTime(0.001, ctx.currentTime + when);
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + when + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + when + 0.25);
      oscillator.connect(gain).connect(ctx.destination);
      oscillator.start(ctx.currentTime + when);
      oscillator.stop(ctx.currentTime + when + 0.26);
    }
    setTimeout(() => ctx.close().catch(() => {}), 1000);
  } catch {
    // Autoplay policies or missing Web Audio: the visual flash still alerts.
  }
}

function waPhone(phone) {
  return phone.replace(/[^\d]/g, "").replace(/^\+/, "");
}

function StatusBadge({ status }) {
  const { t } = useLang();
  return <span className={`status-badge status-${status}`}>{t(`checkout.status.${status}`)}</span>;
}

function PayBadge({ method, state }) {
  const { t } = useLang();
  return (
    <span className={`pay-badge pay-${state}`}>
      {t(`checkout.payMethod.${method}`)} · {t(`checkout.payStatus.${state}`)}
    </span>
  );
}

function OrderCard({ order, drivers, onUpdate, onError }) {
  const { lang, t } = useLang();
  const [busy, setBusy] = useState(false);
  const items = order.order_items ?? [];
  const driver = order.drivers ?? null;
  const next = NEXT_STATUS[order.status];
  const cancellable = !["delivered", "cancelled"].includes(order.status);

  const act = async (patch) => {
    setBusy(true);
    try {
      await onUpdate(order.id, patch);
    } catch (error) {
      onError(error);
    } finally {
      setBusy(false);
    }
  };

  const time = new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(order.created_at));

  return (
    <article className="admin-card admin-order">
      <header className="admin-card-head">
        <span className="admin-order-id">#{order.id.slice(0, 8).toUpperCase()}</span>
        <span className="admin-order-time">{time}</span>
        <StatusBadge status={order.status} />
        <PayBadge method={order.payment_method} state={order.payment_status} />
      </header>

      <div className="admin-order-body">
        <div className="admin-order-customer">
          <strong>{order.customer_name}</strong>
          <span>{order.phone}</span>
          <span className="contact-links">
            <a className="admin-icon-link" href={`tel:+${waPhone(order.phone)}`}>
              <IconPhone size={15} />
              {t("admin.callCustomer")}
            </a>
            <a
              className="admin-icon-link"
              href={`https://wa.me/${waPhone(order.phone)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconChat size={15} />
              {t("admin.waCustomer")}
            </a>
          </span>
        </div>

        <div className="admin-order-items">
          <h4>{t("admin.items")}</h4>
          <ul>
            {items.length > 0 ? (
              items.map((item) => (
                <li key={`${item.slug}-${item.qty}`}>
                  {item.qty} × {lang === "fr" ? item.name_fr : item.name_en}
                  <span className="admin-item-price">{formatPrice(item.line_total_fcfa)}</span>
                </li>
              ))
            ) : (
              <li>{order.order_text}</li>
            )}
          </ul>
        </div>

        <div className="admin-order-meta">
          <p>
            <strong>{t("admin.deliveryTo")}</strong> {order.location}
            {order.zone_name_fr ? ` (${lang === "fr" ? order.zone_name_fr : order.zone_name_en})` : ""}
          </p>
          {order.note ? (
            <p>
              <strong>{t("checkout.note")}</strong> {order.note}
            </p>
          ) : null}
          <p className="admin-order-totals">
            <span>
              {t("checkout.deliveryFee")} {formatPrice(order.delivery_fee_fcfa ?? 0)}
            </span>
            <span className="admin-order-total">
              {t("admin.total")} {formatPrice(order.total_fcfa ?? 0)}
            </span>
          </p>
        </div>
      </div>

      <footer className="admin-order-actions">
        {next ? (
          <button type="button" className="admin-btn" disabled={busy} onClick={() => act({ status: next })}>
            {t(`admin.next.${next}`)}
          </button>
        ) : null}
        {cancellable ? (
          <button
            type="button"
            className="admin-btn admin-btn-danger"
            disabled={busy}
            onClick={() => {
              if (window.confirm(t("admin.confirmCancel"))) act({ status: "cancelled" });
            }}
          >
            {t("admin.cancel")}
          </button>
        ) : null}
        {order.payment_status !== "paid" && order.payment_method !== "cash" ? (
          <button
            type="button"
            className="admin-btn admin-btn-ghost"
            disabled={busy}
            onClick={() => act({ payment_status: "paid" })}
          >
            {t("admin.markPaid")}
          </button>
        ) : null}
        <label className="admin-driver-select">
          <span>{t("admin.driver")}</span>
          <select
            value={order.driver_id ?? ""}
            disabled={busy}
            onChange={(event) => act({ driver_id: event.target.value || null })}
          >
            <option value="">{t("admin.noDriver")}</option>
            {drivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.name}
                {driver.is_active ? "" : ` (${t("admin.drivers.inactive")})`}
              </option>
            ))}
          </select>
        </label>
        {driver ? (
          <a className="admin-icon-link" href={`tel:+${waPhone(driver.phone)}`}>
            <IconPhone size={15} />
            {driver.name}
          </a>
        ) : null}
      </footer>
    </article>
  );
}

export default function AdminOrders() {
  const { t } = useLang();
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [state, setState] = useState("loading");
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("active");
  const [soundOn, setSoundOn] = useState(true);
  const [flash, setFlash] = useState(null);
  const knownIds = useRef(null);

  const load = useCallback(async () => {
    try {
      const [nextOrders, nextDrivers] = await Promise.all([api.listOrders(), api.listDrivers()]);
      const ids = new Set(nextOrders.map((order) => order.id));
      if (knownIds.current !== null) {
        const fresh = nextOrders.filter((order) => !knownIds.current.has(order.id) && order.source === "online");
        if (fresh.length > 0) {
          setFlash(fresh[0].id);
          if (soundOn) playBeep();
          setTimeout(() => setFlash(null), 10000);
        }
      }
      knownIds.current = ids;
      setOrders(nextOrders);
      setDrivers(nextDrivers);
      setState("ready");
      setError(null);
    } catch (err) {
      setError(err.message === "signed-out" ? null : t("admin.loadError"));
      if (err.message !== "signed-out") setState("error");
    }
  }, [soundOn, t]);

  useEffect(() => {
    load();
    const interval = setInterval(load, POLL_MS);
    return () => clearInterval(interval);
  }, [load]);

  const updateOrder = async (id, patch) => {
    await api.updateOrder(id, patch);
    await load();
  };

  const visible = orders.filter((order) => {
    if (filter === "active") return ACTIVE_STATUSES.includes(order.status);
    if (filter === "done") return !ACTIVE_STATUSES.includes(order.status);
    return true;
  });

  return (
    <div className="admin-orders">
      <div className="admin-toolbar">
        <div className="admin-filter" role="group" aria-label={t("admin.filterLabel")}>
          {[
            ["active", t("admin.filterActive")],
            ["all", t("admin.filterAll")],
            ["done", t("admin.filterDone")],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={filter === value ? "admin-tab active" : "admin-tab"}
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={soundOn ? "admin-btn admin-btn-ghost" : "admin-btn admin-btn-ghost muted"}
          aria-pressed={soundOn}
          onClick={() => setSoundOn((on) => !on)}
        >
          {soundOn ? t("admin.soundOn") : t("admin.soundOff")}
        </button>
      </div>

      {flash ? (
        <p className="admin-banner" role="status">
          {t("admin.newOrder")} — #{flash.slice(0, 8).toUpperCase()}
        </p>
      ) : null}
      {error ? (
        <p className="admin-error" role="alert">
          {error}
        </p>
      ) : null}

      {state === "loading" ? <p className="admin-loading">{t("admin.loading")}</p> : null}
      {state === "ready" && visible.length === 0 ? <p className="admin-empty">{t("admin.noOrders")}</p> : null}

      <div className="admin-orders-list">
        {visible.map((order) => (
          <div key={order.id} className={order.id === flash ? "admin-order-wrap flash" : "admin-order-wrap"}>
            <OrderCard order={order} drivers={drivers} onUpdate={updateOrder} onError={(err) => setError(err.message)} />
          </div>
        ))}
      </div>
    </div>
  );
}
