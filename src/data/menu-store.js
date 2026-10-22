// Menu store — the public menu served from Supabase when it is configured,
// with the static files (src/data/menu.js) as the fallback and initial paint.
//
// This is what makes the menu editable from the back-office: the manager
// changes a price in #/admin, the site picks it up on the next page load.
// Pattern follows src/data/daily-specials.js (plain module + custom event).

import { CATEGORIES as STATIC_CATEGORIES, dishes as STATIC_DISHES, drinks as STATIC_DRINKS } from "./menu.js";
import { supabaseConfigured } from "../supabase.js";

const UPDATE_EVENT = "mgh-menu-updated";

function staticState() {
  return {
    dishes: STATIC_DISHES.filter((dish) => dish.confirmed !== false),
    drinks: STATIC_DRINKS,
    categories: STATIC_CATEGORIES,
    specials: null, // remote daily specials, once loaded
    remote: false,
  };
}

let current = staticState();
let loading = null;

function mapDish(row) {
  return {
    id: row.slug,
    category: row.category,
    price: row.price_fcfa,
    spicy: row.spicy,
    veg: row.veg,
    allergens: row.allergens ?? [],
    image: row.image ?? null,
    region: row.region_fr || row.region_en ? { fr: row.region_fr, en: row.region_en } : null,
    name: { fr: row.name_fr, en: row.name_en },
    desc: { fr: row.desc_fr, en: row.desc_en },
  };
}

function mapDrink(row) {
  return {
    id: row.slug,
    price: row.price_fcfa,
    image: row.image ?? null,
    name: { fr: row.name_fr, en: row.name_en },
  };
}

function mapSpecial(row) {
  return {
    day: row.day_of_week,
    image: row.image ?? null,
    meals: { fr: row.meals_fr ?? [], en: row.meals_en ?? [] },
  };
}

function isValidRemote(value) {
  return (
    Array.isArray(value.dishes) &&
    Array.isArray(value.drinks) &&
    Array.isArray(value.categories) &&
    value.dishes.length > 0 &&
    value.dishes.every((dish) => dish.name && dish.desc && Number.isFinite(dish.price)) &&
    value.drinks.every((drink) => drink.name && Number.isFinite(drink.price))
  );
}

/** Fetches the public menu once per page load. Never throws. */
export function loadMenu() {
  if (!supabaseConfigured() || loading) return loading ?? Promise.resolve(current);
  const baseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const headers = { apikey: anonKey, Authorization: `Bearer ${anonKey}` };

  const fetchJson = (path) =>
    fetch(`${baseUrl.replace(/\/+$/, "")}${path}`, { headers }).then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    });

  loading = Promise.all([
    fetchJson("/rest/v1/v_public_menu?select=*&order=sort_order.asc"),
    fetchJson("/rest/v1/drinks?select=slug,name_fr,name_en,price_fcfa,image&is_active=eq.true&order=sort_order.asc"),
    fetchJson("/rest/v1/categories?select=slug,name_fr,name_en&order=sort_order.asc"),
    fetchJson("/rest/v1/daily_specials?select=day_of_week,meals_fr,meals_en,image&order=day_of_week.asc").catch(
      () => []
    ),
  ])
    .then(([dishRows, drinkRows, categoryRows, specialRows]) => {
      const next = {
        dishes: dishRows.map(mapDish),
        drinks: drinkRows.map(mapDrink),
        categories: categoryRows.map((row) => row.slug),
        specials: Array.isArray(specialRows) && specialRows.length === 7 ? specialRows.map(mapSpecial) : null,
        remote: true,
      };
      if (!isValidRemote(next)) throw new Error("Invalid remote menu");
      current = next;
      window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
      return current;
    })
    .catch((error) => {
      console.warn("[menu-store] Using the static menu:", error.message);
      return current;
    });
  return loading;
}

/** Current menu state (static fallback or remote data). */
export function getMenu() {
  return current;
}

/** Subscribes to menu changes; returns an unsubscribe function. */
export function subscribeToMenu(callback) {
  window.addEventListener(UPDATE_EVENT, callback);
  return () => window.removeEventListener(UPDATE_EVENT, callback);
}
