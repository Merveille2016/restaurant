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

/**
 * Saves an order through the public.place_order() RPC — the only anonymous
 * write path (see supabase/migrations/20261020000001_functions.sql). The
 * server re-validates and rate-limits; this call is best-effort bookkeeping
 * on top of the WhatsApp message, which stays the primary channel.
 *
 * Resolves when the order is recorded; rejects on network or server error.
 */
export async function saveOrder({ name, phone, order, location }) {
  const baseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!baseUrl || !anonKey) return false;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${baseUrl.replace(/\/+$/, "")}${PLACE_ORDER_ENDPOINT}`, {
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
