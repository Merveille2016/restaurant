import { ROUTES, routePath } from "./data/seo.js";

export const NAVIGATE_EVENT = "mgh-navigate";

/** Reads { lang, route } from the current URL. Unknown paths fall back to home. */
export function parseLocation() {
  const parts = window.location.pathname
    .replace(/\/+$/, "")
    .split("/")
    .filter(Boolean);
  let lang = "fr";
  if (parts[0] === "en") {
    lang = "en";
    parts.shift();
  }
  const slug = parts.join("/");
  const route = ROUTES.includes(slug) ? slug : "";
  return { lang, route };
}

/** Converts old hash URLs (#/menu) to path URLs (/menu) without a reload. */
export function upgradeLegacyHash() {
  const match = window.location.hash.match(/^#\/?([a-z]*)/);
  if (!match || !window.location.hash.startsWith("#/")) return;
  const route = ROUTES.includes(match[1]) ? match[1] : "";
  const { lang } = parseLocation();
  window.history.replaceState(null, "", routePath(lang, route));
}

export function navigate(path) {
  if (path === window.location.pathname + window.location.hash) return;
  window.history.pushState(null, "", path);
  window.dispatchEvent(new Event(NAVIGATE_EVENT));
}

/** True when a click on this link can be handled in-app instead of a full page load. */
export function isInternalNavigation(event, anchor) {
  if (event.defaultPrevented || event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;
  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return false;
  // Same-page anchors (#traditional) are left to the browser.
  if (url.pathname === window.location.pathname && url.hash) return false;
  return true;
}
