import { dailySpecials as DEFAULT_SPECIALS } from "./menu.js";
import { SITE } from "./site.js";

// Daily specials are edited in a Google Sheet published as CSV (see README).
// The site reads it on load; if the sheet is not configured or can't be read,
// the defaults from menu.js are shown.

const UPDATE_EVENT = "mgh-daily-specials-updated";

// Day index 0 = Monday, matching translations.js → days.
const DAY_NAMES = [
  ["lundi", "monday"],
  ["mardi", "tuesday"],
  ["mercredi", "wednesday"],
  ["jeudi", "thursday"],
  ["vendredi", "friday"],
  ["samedi", "saturday"],
  ["dimanche", "sunday"],
];

let current = DEFAULT_SPECIALS;
let loading = null;

function isValidSpecials(value) {
  return (
    Array.isArray(value) &&
    value.length === 7 &&
    value.every(
      (day) =>
        day &&
        typeof day === "object" &&
        Number.isInteger(day.day) &&
        day.day >= 0 &&
        day.day <= 6 &&
        typeof day.image === "string" &&
        day.meals &&
        Array.isArray(day.meals.fr) &&
        Array.isArray(day.meals.en) &&
        day.meals.fr.length > 0 &&
        day.meals.en.length > 0
    )
  );
}

/** Minimal CSV parser: commas, quoted fields, "" escapes, CRLF or LF rows. */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((cells) => cells.some((cell) => cell.trim() !== ""));
}

function normalize(text) {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function dayIndex(value) {
  const clean = normalize(value);
  const number = Number(clean);
  if (Number.isInteger(number) && number >= 1 && number <= 7) return number - 1;
  return DAY_NAMES.findIndex((names) => names.includes(clean));
}

function splitMeals(value) {
  return value
    .split(/[;\n]/)
    .map((meal) => meal.trim())
    .filter((meal) => meal !== "");
}

function imagePath(value, fallback) {
  const name = value.trim().replace(/^\/?img\//, "").replace(/\.jpe?g$/i, "");
  return /^[a-z0-9-]+$/i.test(name) ? `/img/${name}.jpg` : fallback;
}

/** Turns sheet rows (header: jour, photo, plats_fr, plats_en) into specials. */
export function specialsFromRows(rows) {
  const [header, ...body] = rows;
  const col = Object.fromEntries(header.map((name, index) => [normalize(name), index]));
  if (!["jour", "plats_fr", "plats_en"].every((name) => name in col)) {
    throw new Error("Sheet header must include jour, plats_fr and plats_en");
  }

  const specials = DEFAULT_SPECIALS.map((day) => ({ ...day }));
  for (const cells of body) {
    const index = dayIndex(cells[col.jour] ?? "");
    if (index < 0) continue;
    const fr = splitMeals(cells[col.plats_fr] ?? "");
    const en = splitMeals(cells[col.plats_en] ?? "");
    if (fr.length === 0) continue;
    specials[index] = {
      day: index,
      image: "photo" in col ? imagePath(cells[col.photo] ?? "", specials[index].image) : specials[index].image,
      meals: { fr, en: en.length > 0 ? en : fr },
    };
  }
  return specials;
}

export function getDailySpecials() {
  return current;
}

/** Fetches the published sheet once per page load. Never throws. */
export function loadDailySpecialsFromSheet() {
  if (!SITE.specialsSheetCsvUrl) return Promise.resolve(current);
  if (!loading) {
    loading = fetch(SITE.specialsSheetCsvUrl, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.text();
      })
      .then((text) => {
        const specials = specialsFromRows(parseCsv(text));
        if (!isValidSpecials(specials)) throw new Error("Invalid daily specials sheet");
        current = specials;
        window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
        return current;
      })
      .catch((error) => {
        console.warn("[daily-specials] Using default specials:", error.message);
        return current;
      });
  }
  return loading;
}

export function subscribeToDailySpecials(callback) {
  window.addEventListener(UPDATE_EVENT, callback);
  return () => window.removeEventListener(UPDATE_EVENT, callback);
}
