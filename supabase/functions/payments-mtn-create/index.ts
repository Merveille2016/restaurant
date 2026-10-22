// Starts an MTN MoMo collection for an online order.
//
// Body: { order_id: string, phone: string }
// The customer's MoMo number receives a USSD prompt to confirm with their
// PIN. The amount always comes from the database, never from the request.

import { preflight, json, badRequest, serverError } from "../_shared/cors.ts";
import { getOrder, updateOrder } from "../_shared/supabase.ts";
import { mtnRequestToPay, mtnConfigured, normalizeMsisdn, MtnError } from "../_shared/mtn.ts";

const MAX_ORDER_AGE_MS = 24 * 60 * 60 * 1000;

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return preflight();
  if (request.method !== "POST") return badRequest("POST only");

  try {
    if (!mtnConfigured()) {
      return serverError("MTN MoMo is not configured (missing secrets)");
    }

    const body = await request.json().catch(() => null);
    const orderId = typeof body?.order_id === "string" ? body.order_id : "";
    const msisdn = normalizeMsisdn(typeof body?.phone === "string" ? body.phone : "");
    if (!orderId || !msisdn) return badRequest("order_id and a valid phone are required");

    const order = await getOrder(orderId);
    if (!order) return badRequest("Unknown order");
    if (order.source !== "online") return badRequest("Not an online order");
    if (order.payment_method !== "mtn") return badRequest("Order is not an MTN order");
    if (order.payment_status === "paid") return json({ ok: true, status: "paid" });
    if (Date.now() - Date.parse(order.created_at) > MAX_ORDER_AGE_MS) {
      return badRequest("Order is too old to be paid");
    }

    // A fresh X-Reference-Id per attempt: MTN allows one active requesttopay
    // per reference, and retries after a failure must not collide with it.
    const reference = crypto.randomUUID();
    await mtnRequestToPay({
      reference,
      amount: order.total_fcfa ?? 0,
      msisdn,
      externalId: orderId.slice(0, 8).toUpperCase(),
      message: `Mialine Gifted Hands — commande ${orderId.slice(0, 8).toUpperCase()}`,
    });

    await updateOrder(orderId, {
      payment_ref: reference,
      payment_status: "pending",
    });

    return json({ ok: true, reference });
  } catch (error) {
    if (error instanceof MtnError) return serverError(error.message);
    console.error(error);
    return serverError("Unexpected error");
  }
});
