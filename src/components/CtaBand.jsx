import { useLang } from "../lang-context.js";
import { SITE } from "../data/site.js";
import { waLink } from "../whatsapp.js";
import { IconChat, IconClock, IconPin, IconScooter } from "./Icons.jsx";
import OpenStatus from "./OpenStatus.jsx";

export default function CtaBand() {
  const { t, path } = useLang();

  return (
    <section className="cta-band">
      <div className="container">
        <h2>{t("cta.title")}</h2>
        <p className="section-subtitle">{t("cta.subtitle")}</p>

        <div className="cta-grid">
          <div className="cta-card">
            <IconClock size={32} />
            <h3>{t("cta.hoursTitle")}</h3>
            <p>
              <strong>{t("cta.hoursDays")}</strong>
              <br />
              {t("cta.hoursTime")}
            </p>
            <OpenStatus className="on-dark" />
          </div>

          <div className="cta-card">
            <IconPin size={32} />
            <h3>{t("cta.locationTitle")}</h3>
            <p>
              <strong>{t("cta.locationValue")}</strong>
              <br />
              {t("cta.locationCity")}
            </p>
            <span className="cta-badge">{t("cta.accessBadge")}</span>
          </div>

          <div className="cta-card">
            <IconScooter size={32} />
            <h3>{t("cta.deliveryTitle")}</h3>
            <p>
              <strong>{t("cta.orderTitle")}</strong>
              <br />
              {t("cta.deliveryValue")}
            </p>
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

        <a href={path("contact")} className="btn btn-outline-light">
          {t("cta.more")}
        </a>
      </div>
    </section>
  );
}
