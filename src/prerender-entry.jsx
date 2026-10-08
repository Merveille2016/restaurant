// Renders one route × language to static HTML. Used only by tools/prerender.js
// (via Vite's ssrLoadModule, which handles JSX and CSS imports).
import { renderToStaticMarkup } from "react-dom/server";
import LangProvider from "./i18n.jsx";
import { Shell } from "./App.jsx";

export function renderPage(lang, route) {
  return renderToStaticMarkup(
    <LangProvider lang={lang} route={route}>
      <Shell />
    </LangProvider>
  );
}
