import { useRef, useState } from "react";
import { useLang } from "../lang-context.js";
import { SITE } from "../data/site.js";
import { waLink, deliveryOrderMessage } from "../whatsapp.js";
import { saveOrder, supabaseConfigured } from "../supabase.js";
import { IconChat, IconCheck, IconCopy, IconPhone } from "../components/Icons.jsx";
import SocialLinks from "../components/SocialLinks.jsx";

function Field({ id, label, error, children }) {
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      {children}
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default function Contact() {
  const { lang, t } = useLang();
  const [values, setValues] = useState({ name: "", phone: "", order: "", location: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [saveState, setSaveState] = useState(null);
  const [copied, setCopied] = useState(false);
  const formRef = useRef(null);
  const messageRef = useRef(null);

  const update = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
  };

  const validate = () => {
    const next = {};
    if (values.name.trim().length < 2) next.name = t("contact.form.nameError");
    const digits = values.phone.replace(/[\s.-]/g, "").replace(/^\+/, "");
    if (!/^\d{8,15}$/.test(digits)) next.phone = t("contact.form.phoneError");
    if (values.order.trim().length < 2) next.order = t("contact.form.dishError");
    if (values.location.trim().length < 2) next.location = t("contact.form.locationError");
    return next;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    setCopied(false);

    if (Object.keys(nextErrors).length > 0) {
      const firstKey = ["name", "phone", "order", "location"].find((key) => nextErrors[key]);
      const firstField = formRef.current?.querySelector(`#${firstKey}`);
      firstField?.focus();
      return;
    }

    const payload = {
      name: values.name.trim(),
      phone: values.phone.trim(),
      order: values.order.trim(),
      location: values.location.trim(),
    };
    const built = deliveryOrderMessage(lang, payload);
    setMessage(built);

    // WhatsApp stays the primary channel: it must open synchronously inside
    // the click handler, otherwise popup blockers may interfere. The
    // database save runs in the background and never blocks the customer.
    window.open(waLink(SITE.whatsapp[0].number, built), "_blank", "noopener");

    if (supabaseConfigured()) {
      setSaveState("saving");
      saveOrder(payload)
        .then(() => setSaveState("saved"))
        .catch(() => setSaveState("error"));
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
    } catch {
      if (messageRef.current) {
        messageRef.current.select();
        document.execCommand("copy");
        setCopied(true);
      }
    }
  };

  const mapQuery = encodeURIComponent(SITE.mapQuery);

  return (
    <div className="page-contact">
      <header className="page-hero">
        <h1>{t("contact.title")}</h1>
        <p>{t("contact.tagline")}</p>
      </header>

      <section className="contact-section">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-card">
              <h2>{t("cta.hoursTitle")}</h2>
              <p>
                <strong>{t("cta.hoursDays")}</strong>
                <br />
                {t("cta.hoursTime")}
              </p>
              <span className="cta-badge">{t("cta.openBadge")}</span>
            </div>
            <div className="contact-card">
              <h2>{t("cta.locationTitle")}</h2>
              <p>
                <strong>{t("cta.locationValue")}</strong>
                <br />
                {t("cta.locationCity")}
              </p>
              <span className="cta-badge">{t("cta.accessBadge")}</span>
            </div>
            <div className="contact-card">
              <h2>{t("cta.deliveryTitle")}</h2>
              <p>{t("cta.deliveryValue")}</p>
              <div className="cta-whatsapp">
                {SITE.whatsapp.map((wa) => (
                  <a
                    key={wa.number}
                    href={waLink(wa.number, t("hero.waMessage"))}
                    className="whatsapp-btn"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <IconChat size={18} />
                    {wa.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="contact-extra">
            <p>
              <strong>{t("events.title")}</strong> — {t("contact.eventsNote")}
            </p>
            <p className="contact-follow">{t("social.title")}</p>
            <SocialLinks />
          </div>
        </div>
      </section>

      <section className="order-section">
        <div className="container narrow">
          <h2>{t("contact.formTitle")}</h2>
          <p className="section-subtitle">{t("contact.formSubtitle")}</p>

          <form ref={formRef} className="order-form" onSubmit={handleSubmit} noValidate>
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
            <Field id="order" label={t("contact.form.dish")} error={errors.order}>
              <textarea id="order" rows="4" value={values.order} onChange={update("order")} />
            </Field>
            <Field id="location" label={t("contact.form.location")} error={errors.location}>
              <input
                id="location"
                type="text"
                value={values.location}
                onChange={update("location")}
              />
            </Field>

            <button type="submit" className="btn btn-whatsapp btn-block">
              <IconChat size={18} />
              {t("contact.form.submit")}
            </button>
          </form>

          {message ? (
            <div className="order-ready" role="status">
              <p>{t("contact.form.ready")}</p>
              {saveState === "saving" ? (
                <p className="order-save-status">{t("contact.form.saving")}</p>
              ) : null}
              {saveState === "saved" ? (
                <p className="order-save-status saved">{t("contact.form.saved")}</p>
              ) : null}
              {saveState === "error" ? (
                <p className="order-save-status error">{t("contact.form.saveError")}</p>
              ) : null}
              <div className="order-ready-actions">
                {SITE.whatsapp.map((wa) => (
                  <a
                    key={wa.number}
                    href={waLink(wa.number, message)}
                    className="whatsapp-btn"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <IconChat size={18} />
                    {wa.label}
                  </a>
                ))}
                <button type="button" className="btn btn-outline" onClick={handleCopy}>
                  {copied ? <IconCheck size={18} /> : <IconCopy size={18} />}
                  {copied ? t("contact.form.copied") : t("contact.form.copy")}
                </button>
              </div>
              <textarea
                ref={messageRef}
                className="order-message"
                rows="8"
                readOnly
                value={message}
                aria-label={t("contact.form.copy")}
              />
              <div className="order-call">
                {SITE.whatsapp.map((wa) => (
                  <a key={wa.number} href={`tel:+${wa.number}`} className="call-link">
                    <IconPhone size={16} />
                    {t("contact.form.call")} {wa.label}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="map-section">
        <div className="container">
          <h2>{t("contact.mapTitle")}</h2>
          <div className="map-container">
            <iframe
              src={`https://www.google.com/maps?q=${mapQuery}&output=embed&z=15`}
              title={t("contact.mapFrameTitle")}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <a
            className="btn btn-outline map-directions"
            href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("contact.directions")}
          </a>
        </div>
      </section>
    </div>
  );
}
