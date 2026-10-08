import { DICT } from "../src/translations.js";
import { ok, fail } from "./lib.js";

function keyPaths(obj, prefix = "") {
  const paths = [];
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      paths.push(...keyPaths(value, path));
    } else {
      paths.push(path);
    }
  }
  return paths;
}

function checkLeaf(path, value, lang, errors) {
  if (Array.isArray(value)) {
    if (value.length === 0) errors.push(`[${lang}] ${path}: empty array`);
    value.forEach((item, index) => {
      if (item !== null && typeof item === "object") {
        checkLeaf(`${path}[${index}]`, item, lang, errors);
      } else if (typeof item !== "string" || item.trim().length === 0) {
        errors.push(`[${lang}] ${path}[${index}]: empty or non-string value`);
      }
    });
    return;
  }
  if (value !== null && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      checkLeaf(`${path}.${key}`, child, lang, errors);
    }
    return;
  }
  if (typeof value !== "string" || value.trim().length === 0) {
    errors.push(`[${lang}] ${path}: empty or non-string value`);
  }
}

export function run() {
  const errors = [];

  const frPaths = new Set(keyPaths(DICT.fr));
  const enPaths = new Set(keyPaths(DICT.en));

  for (const path of frPaths) {
    if (!enPaths.has(path)) errors.push(`[en] missing key: ${path}`);
  }
  for (const path of enPaths) {
    if (!frPaths.has(path)) errors.push(`[fr] missing key: ${path}`);
  }

  for (const lang of ["fr", "en"]) {
    for (const path of keyPaths(DICT[lang])) {
      const value = path.split(".").reduce((obj, key) => obj?.[key], DICT[lang]);
      checkLeaf(path, value, lang, errors);
    }
  }

  const frDays = DICT.fr.days;
  const enDays = DICT.en.days;
  if (!Array.isArray(frDays) || frDays.length !== 7) {
    errors.push("[fr] days: expected 7 day names");
  }
  if (!Array.isArray(enDays) || enDays.length !== 7) {
    errors.push("[en] days: expected 7 day names");
  }

  return errors.length === 0
    ? ok("check-i18n")
    : fail("check-i18n", errors);
}
