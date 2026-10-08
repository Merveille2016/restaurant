import { useCallback, useEffect } from "react";
import { DICT } from "./translations.js";
import { LangContext } from "./lang-context.js";
import { PAGES, routePath } from "./data/seo.js";
import { navigate } from "./router.js";

const DEFAULT_LANG = "fr";

function resolvePath(dict, path) {
  return path.split(".").reduce((obj, key) => (obj == null ? undefined : obj[key]), dict);
}

/** The language comes from the URL (/en/... is English), so each page has one indexable address per language. */
export default function LangProvider({ lang, route, children }) {
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = PAGES[lang][route].title;
  }, [lang, route]);

  const t = useCallback(
    (path) => {
      const value = resolvePath(DICT[lang], path);
      return value === undefined ? resolvePath(DICT[DEFAULT_LANG], path) : value;
    },
    [lang]
  );

  const path = useCallback((target) => routePath(lang, target), [lang]);

  const setLang = useCallback(
    (next) => {
      if (next !== lang) navigate(routePath(next, route));
    },
    [lang, route]
  );

  return (
    <LangContext.Provider value={{ lang, setLang, t, path, route }}>{children}</LangContext.Provider>
  );
}
