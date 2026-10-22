// Cart store — localStorage + a custom event, mirroring the pattern of
// src/data/daily-specials.js (no external state library, per the README).
//
// Items are stored as display snapshots: the authoritative prices are the
// ones in the database, recomputed server-side by place_online_order().

const STORAGE_KEY = "mgh-cart";
const UPDATE_EVENT = "mgh-cart-updated";
export const MAX_QTY = 99;

function isValidItem(item) {
  return (
    item &&
    (item.type === "dish" || item.type === "drink") &&
    typeof item.slug === "string" &&
    item.slug.length > 0 &&
    item.name &&
    typeof item.name.fr === "string" &&
    typeof item.name.en === "string" &&
    Number.isFinite(item.price) &&
    item.price >= 0
  );
}

function normalizeItem(item) {
  return {
    type: item.type,
    slug: item.slug,
    name: { fr: item.name.fr, en: item.name.en },
    price: item.price,
    image: typeof item.image === "string" ? item.image : null,
    qty: Math.min(MAX_QTY, Math.max(1, Math.round(item.qty) || 1)),
  };
}

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(isValidItem).map(normalizeItem) : [];
  } catch {
    return [];
  }
}

function write(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Private-browsing quota errors are ignored: the cart simply won't
    // survive the page reload.
  }
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
}

/** Current cart lines (defensive copy). */
export function getCart() {
  return read();
}

/** Adds one unit of an item, or increases its quantity. */
export function addToCart(item) {
  if (!isValidItem({ ...item, qty: 1 })) return;
  const items = read();
  const existing = items.find((line) => line.type === item.type && line.slug === item.slug);
  if (existing) {
    existing.qty = Math.min(MAX_QTY, existing.qty + 1);
  } else {
    items.push(normalizeItem({ ...item, qty: 1 }));
  }
  write(items);
}

/** Sets an absolute quantity (0 removes the line). */
export function setCartQty(type, slug, qty) {
  let items = read();
  if (!Number.isFinite(qty) || qty <= 0) {
    items = items.filter((line) => !(line.type === type && line.slug === slug));
  } else {
    items = items.map((line) =>
      line.type === type && line.slug === slug
        ? { ...line, qty: Math.min(MAX_QTY, Math.round(qty)) }
        : line
    );
  }
  write(items);
}

export function removeFromCart(type, slug) {
  write(read().filter((line) => !(line.type === type && line.slug === slug)));
}

export function clearCart() {
  write([]);
}

/** Total number of units in the cart. */
export function cartCount() {
  return read().reduce((sum, line) => sum + line.qty, 0);
}

/** Estimated subtotal from the display snapshots (server recomputes it). */
export function cartSubtotal() {
  return read().reduce((sum, line) => sum + line.price * line.qty, 0);
}

/** Subscribes to cart changes; returns an unsubscribe function. */
export function subscribeToCart(callback) {
  window.addEventListener(UPDATE_EVENT, callback);
  return () => window.removeEventListener(UPDATE_EVENT, callback);
}
