import { useLang } from "../lang-context.js";
import { SITE } from "../data/site.js";
import { waLink } from "../whatsapp.js";
import { IconChat } from "./Icons.jsx";

const LINKS = [
  ["", "nav.home"],
  ["menu", "nav.menu"],
  ["about", "nav.about"],
  ["contact", "nav.contact"],
];

export default function Footer() {
  const { t, path } = useLang();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <p className="footer-logo">{SITE.name}</p>
          <p className="footer-tagline">{t("footer.tagline")}</p>
        </div>

        <nav className="footer-col" aria-label={t("footer.navTitle")}>
          <h3>{t("footer.navTitle")}</h3>
          {LINKS.map(([route, key]) => (
            <a key={route} href={path(route)} className="footer-link">
              {t(key)}
            </a>
          ))}
        </nav>

        <div className="footer-col">
          <h3>{t("footer.contactTitle")}</h3>
          <p>{t("cta.locationValue")}</p>
          <p>{t("cta.locationCity")}</p>
          <p>{t("cta.hoursDays")}</p>
          <p>{t("cta.hoursTime")}</p>
        </div>

        <div className="footer-col">
          <h3>{t("footer.orderTitle")}</h3>
          <div className="footer-whatsapp">
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

      <div className="footer-bottom">
        <p>
          © {year} {SITE.name}. {t("footer.rights")}
        </p>
        <p>{t("footer.pricesNote")}</p>
      </div>
    </footer>
  );
}
