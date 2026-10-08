import { useState } from "react";
import { useLang } from "../lang-context.js";
import { SITE } from "../data/site.js";
import { IconBurger, IconClose } from "./Icons.jsx";

const LINKS = [
  ["", "nav.home"],
  ["menu", "nav.menu"],
  ["about", "nav.about"],
  ["contact", "nav.contact"],
];

function NavLink({ path, labelKey, route, className, onNavigate }) {
  const { path: toPath } = useLang();
  const isActive = route === path;
  return (
    <a
      href={toPath(path)}
      className={isActive ? `${className} active` : className}
      aria-current={isActive ? "page" : undefined}
      onClick={onNavigate}
    >
      {labelKey}
    </a>
  );
}

export default function Header({ route }) {
  const { lang, setLang, t, path } = useLang();
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="header-logo" href={path("")} onClick={closeMenu}>
          <img
            className="header-logo-img"
            src="/img/logo-96.webp"
            alt=""
            width="44"
            height="44"
          />
          {SITE.name}
        </a>

        <nav className="header-nav" aria-label={t("nav.menu")}>
          {LINKS.map(([target, key]) => (
            <NavLink key={target} path={target} labelKey={t(key)} route={route} className="header-link" />
          ))}
        </nav>

        <div className="header-actions">
          <div className="lang-switch" role="group" aria-label={t("langLabel")}>
            <button
              type="button"
              className={lang === "fr" ? "lang-btn active" : "lang-btn"}
              aria-pressed={lang === "fr"}
              onClick={() => {
                closeMenu();
                setLang("fr");
              }}
            >
              FR
            </button>
            <button
              type="button"
              className={lang === "en" ? "lang-btn active" : "lang-btn"}
              aria-pressed={lang === "en"}
              onClick={() => {
                closeMenu();
                setLang("en");
              }}
            >
              EN
            </button>
          </div>

          <button
            type="button"
            className="nav-toggle"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? t("navToggleClose") : t("navToggleOpen")}
            onClick={() => setOpen(!open)}
          >
            {open ? <IconClose /> : <IconBurger />}
          </button>
        </div>
      </div>

      <nav id="mobile-nav" className={open ? "mobile-nav open" : "mobile-nav"} aria-label={t("nav.menu")}>
        {LINKS.map(([target, key]) => (
          <NavLink
            key={target}
            path={target}
            labelKey={t(key)}
            route={route}
            className="mobile-link"
            onNavigate={closeMenu}
          />
        ))}
      </nav>
    </header>
  );
}
