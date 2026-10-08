// Pre-renders every route × language to static HTML in dist/, so each page
// has its own indexable URL, title and description. Runs after `vite build`.
import { createServer } from "vite";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { LANGS, PAGES, ROUTES, routePath } from "../src/data/seo.js";
import { SITE } from "../src/data/site.js";

const distDir = path.resolve(process.cwd(), "dist");

const AMP = String.fromCharCode(38);
const QUOT = String.fromCharCode(34);

function escapeHtml(value) {
  return value
    .replace(/&/g, AMP + "amp;")
    .replace(/</g, AMP + "lt;")
    .replace(new RegExp(QUOT, "g"), AMP + "quot;");
}

function replaceOnce(html, regex, replacement) {
  if (!regex.test(html)) {
    throw new Error(`prerender: template does not match ${regex}`);
  }
  return html.replace(regex, replacement);
}

function buildDocument(template, { lang, route, url }) {
  const meta = PAGES[lang][route];
  const frUrl = SITE.url + routePath("fr", route);
  const enUrl = SITE.url + routePath("en", route);
  let html = template;

  html = replaceOnce(html, /<html lang="fr">/, `<html lang="${lang}">`);
  html = replaceOnce(html, /<title>[^<]*<\/title>/, `<title>${escapeHtml(meta.title)}</title>`);
  html = replaceOnce(
    html,
    /<meta\s+name="description"[\s\S]*?\/>/,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`
  );
  html = replaceOnce(
    html,
    /<meta property="og:title" content="[^"]*" \/>/,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`
  );
  html = replaceOnce(
    html,
    /<meta property="og:description" content="[^"]*" \/>/,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`
  );
  html = replaceOnce(
    html,
    /<meta property="og:url" content="[^"]*" \/>/,
    `<meta property="og:url" content="${url}" />`
  );
  html = replaceOnce(
    html,
    /<meta property="og:locale" content="[^"]*" \/>/,
    `<meta property="og:locale" content="${lang === "fr" ? "fr_CM" : "en_CM"}" />`
  );
  html = replaceOnce(
    html,
    /<meta property="og:locale:alternate" content="[^"]*" \/>/,
    `<meta property="og:locale:alternate" content="${lang === "fr" ? "en_CM" : "fr_CM"}" />`
  );
  html = replaceOnce(
    html,
    /<link rel="canonical" href="[^"]*" \/>/,
    `<link rel="canonical" href="${url}" />`
  );
  html = replaceOnce(
    html,
    /<link rel="alternate" hreflang="fr" href="[^"]*" \/>/,
    `<link rel="alternate" hreflang="fr" href="${frUrl}" />`
  );
  html = replaceOnce(
    html,
    /<link rel="alternate" hreflang="en" href="[^"]*" \/>/,
    `<link rel="alternate" hreflang="en" href="${enUrl}" />`
  );
  html = replaceOnce(
    html,
    /<link rel="alternate" hreflang="x-default" href="[^"]*" \/>/,
    `<link rel="alternate" hreflang="x-default" href="${frUrl}" />`
  );
  return html;
}

const vite = await createServer({
  root: process.cwd(),
  logLevel: "warn",
  server: { middlewareMode: true },
  appType: "custom",
});

try {
  const { renderPage } = await vite.ssrLoadModule("/src/prerender-entry.jsx");
  const template = await readFile(path.join(distDir, "index.html"), "utf8");

  for (const lang of LANGS) {
    for (const route of ROUTES) {
      const appHtml = renderPage(lang, route);
      const url = SITE.url + routePath(lang, route);
      const document = buildDocument(template, { lang, route, url })
        .replace(
          /<div id="root"><\/div>/,
          `<div id="root">${appHtml}</div>`
        );

      const routeUrl = routePath(lang, route);
      const outFile = path.join(distDir, routeUrl.replace(/^\//, ""), "index.html");
      await mkdir(path.dirname(outFile), { recursive: true });
      await writeFile(outFile, document);
      console.log(`prerender  ${routeUrl}`);
    }
  }
} finally {
  await vite.close();
}
