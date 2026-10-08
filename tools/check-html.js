import { listSourceFiles, readRoot, ok, fail } from "./lib.js";

export function run() {
  const errors = [];
  const html = readRoot("index.html");

  if (!/<html lang="fr"/.test(html)) {
    errors.push('index.html: missing lang="fr" on <html>');
  }
  if (!/<meta name="viewport"/.test(html)) {
    errors.push("index.html: missing viewport meta");
  }
  if (!/<title>[^<]+<\/title>/.test(html)) {
    errors.push("index.html: missing <title>");
  }
  if (html.includes("my-restaurant")) {
    errors.push('index.html: title still contains "my-restaurant"');
  }
  if (!/<meta\s+name="description"/.test(html)) {
    errors.push("index.html: missing meta description");
  }
  if (!/application\/ld\+json/.test(html)) {
    errors.push("index.html: missing JSON-LD structured data");
  }
  if (!/property="og:title"/.test(html)) {
    errors.push("index.html: missing Open Graph tags");
  }
  if (!/rel="preconnect"/.test(html)) {
    errors.push("index.html: missing font preconnect");
  }

  const pages = listSourceFiles("src/pages", [".jsx"]);
  if (pages.length < 4) {
    errors.push(`src/pages: expected at least 4 pages, found ${pages.length}`);
  }
  for (const page of pages) {
    const content = readRoot(page);
    const h1Count = (content.match(/<h1/g) ?? []).length;
    if (h1Count !== 1) {
      errors.push(`${page}: expected exactly one <h1>, found ${h1Count}`);
    }
  }

  return errors.length === 0
    ? ok("check-html")
    : fail("check-html", errors);
}
