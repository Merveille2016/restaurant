// Notifies the restaurant about a placed order (cash on delivery).
//
// Body: { order_id: string }
// Called best-effort by the checkout right after a cash order is recorded;
// paid orders are notified by the payment check/webhook functions instead.
// Never throws back at the caller — the customer must not see an error
// because a notification failed.

import { preflight, json, badRequest } from "../_shared/cors.ts";
import { getOrder } from "../_shared/supabase.ts";
import { notifyOrder } from "../_shared/notify.ts";

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return preflight();
  if (request.method !== "POST") return badRequest("POST only");

  try {
    const body = await request.json().catch(() => null);
    const orderId = typeof body?.order_id === "string" ? body.order_id : "";
    if (!orderId) return badRequest("order_id is required");

    const order = await getOrder(orderId);
    if (!order) return badRequest("Unknown order");

    await notifyOrder(order);
    return json({ ok: true });
  } catch (error) {
    console.error(error);
    return json({ ok: false });
  }
});
