import { useEffect, useState } from "react";
import "./App.css";
import LangProvider from "./i18n.jsx";
import { useLang } from "./lang-context.js";
import {
  NAVIGATE_EVENT,
  isInternalNavigation,
  navigate,
  parseLocation,
  upgradeLegacyHash,
} from "./router.js";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import MobileOrderBar from "./components/MobileOrderBar.jsx";
import Home from "./pages/Home.jsx";
import Menu from "./pages/Menu.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Checkout from "./pages/Checkout.jsx";
import Admin from "./pages/Admin.jsx";

const PAGES = {
  "": Home,
  menu: Menu,
  about: About,
  contact: Contact,
  commande: Checkout,
  admin: Admin,
};

export function Shell() {
  const { t, route } = useLang();
  const Page = PAGES[route];

  const handleSkip = (event) => {
    event.preventDefault();
    const main = document.getElementById("main");
    if (main) {
      main.setAttribute("tabindex", "-1");
      main.focus({ preventScroll: false });
      main.removeAttribute("tabindex");
    }
  };

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main" onClick={handleSkip}>
        {t("skipToContent")}
      </a>
      <Header route={route} />
      <main id="main">
        <Page />
      </main>
      <Footer />
      <MobileOrderBar />
    </div>
  );
}

export default function App() {
  const [location, setLocation] = useState(() => {
    upgradeLegacyHash();
    return parseLocation();
  });

  useEffect(() => {
    const onChange = () => setLocation(parseLocation());
    const onClick = (event) => {
      const anchor = event.target.closest?.("a[href]");
      if (!anchor || !isInternalNavigation(event, anchor)) return;
      event.preventDefault();
      const url = new URL(anchor.href);
      navigate(url.pathname + url.hash);
    };
    window.addEventListener("popstate", onChange);
    window.addEventListener(NAVIGATE_EVENT, onChange);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("popstate", onChange);
      window.removeEventListener(NAVIGATE_EVENT, onChange);
      document.removeEventListener("click", onClick);
    };
  }, []);

  useEffect(() => {
    if (!window.location.hash) window.scrollTo(0, 0);
  }, [location.route, location.lang]);

  return (
    <LangProvider lang={location.lang} route={location.route}>
      <Shell />
    </LangProvider>
  );
}
