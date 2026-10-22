// Authenticated REST helpers for the back-office. Every call carries the
// manager's Supabase access token; RLS (public.is_admin()) does the actual
// authorization on the server. A 401 triggers one silent refresh + retry.

import { adminSession, adminSignOut } from "./auth.js";

async function request(path, options = {}, retry = true) {
  const session = await adminSession();
  if (!session) throw new Error("signed-out");

  const { baseUrl, anonKey } = {
    baseUrl: import.meta.env.VITE_SUPABASE_URL.replace(/\/+$/, ""),
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  };
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      apikey: anonKey,
      Authorization: `Bearer ${session.access_token}`,
      ...options.headers,
    },
  });

  if (response.status === 401 && retry) {
    const refreshed = await adminSession();
    if (refreshed) return request(path, options, false);
    await adminSignOut();
    throw new Error("signed-out");
  }
  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(message || `HTTP ${response.status}`);
  }

  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

const MINIMAL = { Prefer: "return=minimal" };

export const api = {
  // ── Orders ────────────────────────────────────────────────────────────
  listOrders: () =>
    request(
      "/rest/v1/orders?select=*,order_items(order_id,item_type,slug,name_fr,name_en,unit_price_fcfa,qty,line_total_fcfa),drivers(id,name,phone)" +
        "&order=created_at.desc&limit=100"
    ),

  updateOrder: (id, patch) =>
    request(`/rest/v1/orders?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: MINIMAL,
      body: JSON.stringify(patch),
    }),

  // ── Drivers ───────────────────────────────────────────────────────────
  listDrivers: () => request("/rest/v1/drivers?select=*&order=created_at.asc"),

  createDriver: (driver) =>
    request("/rest/v1/drivers", {
      method: "POST",
      headers: MINIMAL,
      body: JSON.stringify(driver),
    }),

  updateDriver: (id, patch) =>
    request(`/rest/v1/drivers?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: MINIMAL,
      body: JSON.stringify(patch),
    }),

  deleteDriver: (id) =>
    request(`/rest/v1/drivers?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: MINIMAL,
    }),

  // ── Menu: dishes ──────────────────────────────────────────────────────
  listDishes: () =>
    request(
      "/rest/v1/dishes?select=slug,category,price_fcfa,spicy,veg,confirmed,is_active,allergens,region_fr,region_en,name_fr,name_en,desc_fr,desc_en,image,sort_order&order=sort_order.asc"
    ),

  listCategories: () =>
    request("/rest/v1/categories?select=slug,name_fr,name_en&order=sort_order.asc"),

  createDish: (dish) =>
    request("/rest/v1/dishes", {
      method: "POST",
      headers: MINIMAL,
      body: JSON.stringify(dish),
    }),

  updateDish: (slug, patch) =>
    request(`/rest/v1/dishes?slug=eq.${encodeURIComponent(slug)}`, {
      method: "PATCH",
      headers: MINIMAL,
      body: JSON.stringify(patch),
    }),

  // ── Menu: drinks ──────────────────────────────────────────────────────
  listDrinks: () =>
    request("/rest/v1/drinks?select=slug,name_fr,name_en,price_fcfa,image,is_active,sort_order&order=sort_order.asc"),

  createDrink: (drink) =>
    request("/rest/v1/drinks", {
      method: "POST",
      headers: MINIMAL,
      body: JSON.stringify(drink),
    }),

  updateDrink: (slug, patch) =>
    request(`/rest/v1/drinks?slug=eq.${encodeURIComponent(slug)}`, {
      method: "PATCH",
      headers: MINIMAL,
      body: JSON.stringify(patch),
    }),

  // ── Menu: daily specials (upsert by day_of_week) ──────────────────────
  listSpecials: () =>
    request("/rest/v1/daily_specials?select=day_of_week,meals_fr,meals_en,image&order=day_of_week.asc"),

  saveSpecials: (rows) =>
    request("/rest/v1/daily_specials", {
      method: "POST",
      headers: { Prefer: "return=minimal,resolution=merge-duplicates" },
      body: JSON.stringify(rows),
    }),

  // ── Settings ──────────────────────────────────────────────────────────
  listZones: () =>
    request("/rest/v1/delivery_zones?select=id,name_fr,name_en,fee_fcfa,sort_order&order=sort_order.asc"),

  createZone: (zone) =>
    request("/rest/v1/delivery_zones", {
      method: "POST",
      headers: MINIMAL,
      body: JSON.stringify(zone),
    }),

  updateZone: (id, patch) =>
    request(`/rest/v1/delivery_zones?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: MINIMAL,
      body: JSON.stringify(patch),
    }),

  deleteZone: (id) =>
    request(`/rest/v1/delivery_zones?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: MINIMAL,
    }),

  getSettings: () => request("/rest/v1/site_settings?id=eq.1&select=*"),

  updateSettings: (patch) =>
    request("/rest/v1/site_settings?id=eq.1", {
      method: "PATCH",
      headers: MINIMAL,
      body: JSON.stringify(patch),
    }),
};
