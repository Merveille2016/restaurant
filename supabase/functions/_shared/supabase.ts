// Service-role access to the orders through the Supabase REST API.
// Edge Functions run with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
// injected automatically — the service key bypasses RLS, so every helper
// here must be deliberate about what it exposes.

export interface OrderItem {
  item_type: string;
  slug: string;
  name_fr: string;
  name_en: string;
  unit_price_fcfa: number;
  qty: number;
  line_total_fcfa: number;
}

export interface Order {
  id: string;
  customer_name: string;
  phone: string;
  order_text: string;
  location: string;
  status: string;
  source: string;
  zone_name_fr: string | null;
  zone_name_en: string | null;
  subtotal_fcfa: number | null;
  delivery_fee_fcfa: number | null;
  total_fcfa: number | null;
  payment_method: string;
  payment_status: string;
  payment_ref: string | null;
  payment_token: string | null;
  notif_token: string | null;
  driver_id: string | null;
  note: string | null;
  created_at: string;
  order_items: OrderItem[];
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

function headers(): Record<string, string> {
  return {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    "Content-Type": "application/json",
  };
}

/** Loads one order with its items. Returns null when not found. */
export async function getOrder(orderId: string): Promise<Order | null> {
  const url =
    `${SUPABASE_URL}/rest/v1/orders?select=*,order_items(order_id,item_type,slug,name_fr,name_en,` +
    `unit_price_fcfa,qty,line_total_fcfa)&id=eq.${encodeURIComponent(orderId)}`;
  const response = await fetch(url, { headers: headers() });
  if (!response.ok) return null;
  const rows = (await response.json()) as Order[];
  return rows.length > 0 ? rows[0] : null;
}

/** Patches an order row (payment status, provider references, workflow…). */
export async function updateOrder(
  orderId: string,
  patch: Record<string, unknown>,
): Promise<boolean> {
  const url = `${SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`;
  const response = await fetch(url, {
    method: "PATCH",
    headers: { ...headers(), Prefer: "return=minimal" },
    body: JSON.stringify(patch),
  });
  return response.ok;
}

/** Finds the order matching an Orange notif_token (webhook verification). */
export async function findOrderByNotifToken(token: string): Promise<Order | null> {
  const url =
    `${SUPABASE_URL}/rest/v1/orders?select=*,order_items(order_id,item_type,slug,name_fr,name_en,` +
    `unit_price_fcfa,qty,line_total_fcfa)&notif_token=eq.${encodeURIComponent(token)}`;
  const response = await fetch(url, { headers: headers() });
  if (!response.ok) return null;
  const rows = (await response.json()) as Order[];
  return rows.length > 0 ? rows[0] : null;
}
