// Delivery-order bookkeeping through the Supabase REST API.
//
// The site deliberately avoids the supabase-js client: a single fetch to the
// public.place_order() RPC keeps the bundle free of any non-React dependency
// (see README). Credentials are read lazily inside the functions, so the
// prerender (tools/prerender.js) and local development work without them —
// without configuration the site simply keeps its WhatsApp-only behaviour.
//
// The anon key is public by design (it ships to every browser and is gated by
// RLS). Never expose the service_role key in a VITE_ variable.

const PLACE_ORDER_ENDPOINT = "/rest/v1/rpc/place_order";
const REQUEST_TIMEOUT_MS = 8000;

/** True when the Supabase environment variables are configured. */
export function supabaseConfigured() {
  return Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
}

function credentials() {
  return {
    baseUrl: import.meta.env.VITE_SUPABASE_URL.replace(/\/+$/, ""),
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  };
}

async function post(path, body, timeoutMs = REQUEST_TIMEOUT_MS) {
  const { baseUrl, anonKey } = credentials();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!response.ok) {
      const message = await response.text().catch(() => "");
      throw new Error(`HTTP ${response.status}${message ? `: ${message.slice(0, 300)}` : ""}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Saves an order through the public.place_order() RPC — the only anonymous
 * write path for the WhatsApp flow (see supabase/migrations/…_functions.sql).
 * The server re-validates and rate-limits; this call is best-effort
 * bookkeeping on top of the WhatsApp message, which stays the primary channel.
 *
 * Resolves when the order is recorded; rejects on network or server error.
 */
export async function saveOrder({ name, phone, order, location }) {
  const { baseUrl, anonKey } = credentials();
  if (!baseUrl || !anonKey) return false;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${baseUrl}${PLACE_ORDER_ENDPOINT}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify({
        customer_name: name,
        phone,
        order_text: order,
        location,
      }),
      signal: controller.signal,
    });

    if (!response.ok) throw new Error(`place_order failed: HTTP ${response.status}`);
    return true;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Places a structured online order through public.place_online_order().
 * Only slugs and quantities are sent: the server computes the authoritative
 * prices, delivery fee and total from the database.
 */
export async function placeOnlineOrder({ name, phone, items, zoneId, location, note, paymentMethod }) {
  const result = await post("/rest/v1/rpc/place_online_order", {
    customer_name: name,
    phone,
    items,
    delivery_zone_id: zoneId,
    location,
    note: note || null,
    payment_method: paymentMethod,
  });
  if (!result || !result.order_id) throw new Error("Unexpected server response");
  return result;
}

/** Limited public status of an online order (capability: the order UUID). */
export async function getPublicOrder(orderId) {
  const result = await post("/rest/v1/rpc/get_order_public", { p_order_id: orderId });
  return result ?? null;
}

/** Delivery zones shown in the checkout (falls back to src/data/site.js). */
export async function fetchDeliveryZones() {
  const { baseUrl, anonKey } = credentials();
  const response = await fetch(
    `${baseUrl}/rest/v1/delivery_zones?select=id,name_fr,name_en,fee_fcfa&order=sort_order.asc`,
    { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` } }
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

/**
 * Calls a payment Edge Function (payments-mtn-create, payments-orange-check…).
 * The anon key gates the call; the function itself re-reads every amount
 * from the database.
 */
export async function callFunction(name, body) {
  const { baseUrl, anonKey } = credentials();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(`${baseUrl}/functions/v1/${name}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.error || `HTTP ${response.status}`);
    }
    return payload;
  } finally {
    clearTimeout(timeout);
  }
}
