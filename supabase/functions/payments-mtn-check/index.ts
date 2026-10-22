// Polls the MTN requesttopay status for an order and applies the result.
//
// Body: { order_id: string }
// Returns { payment_status: "pending" | "paid" | "failed" }. On SUCCESSFUL
// the order is marked paid, moves to "confirmed" and the restaurant is
// notified (email/SMS). The checkout page calls this every few seconds
// while the customer confirms on their handset.

import { preflight, json, badRequest, serverError } from "../_shared/cors.ts";
import { getOrder, updateOrder } from "../_shared/supabase.ts";
import { mtnGetStatus, MtnError } from "../_shared/mtn.ts";
import { notifyOrder } from "../_shared/notify.ts";

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return preflight();
  if (request.method !== "POST") return badRequest("POST only");

  try {
    const body = await request.json().catch(() => null);
    const orderId = typeof body?.order_id === "string" ? body.order_id : "";
    if (!orderId) return badRequest("order_id is required");

    const order = await getOrder(orderId);
    if (!order || !order.payment_ref) return badRequest("No MTN payment in progress");

    if (order.payment_status === "paid") return json({ payment_status: "paid" });
    if (order.payment_status === "failed") return json({ payment_status: "failed" });

    const status = await mtnGetStatus(order.payment_ref);

    if (status === "SUCCESSFUL") {
      await updateOrder(orderId, {
        payment_status: "paid",
        status: order.status === "new" ? "confirmed" : order.status,
      });
      order.payment_status = "paid";
      await notifyOrder(order);
      return json({ payment_status: "paid" });
    }

    if (status === "FAILED" || status === "REJECTED" || status === "TIMEOUT") {
      await updateOrder(orderId, { payment_status: "failed" });
      return json({ payment_status: "failed", mtn_status: status });
    }

    return json({ payment_status: "pending", mtn_status: status });
  } catch (error) {
    if (error instanceof MtnError) return serverError(error.message);
    console.error(error);
    return serverError("Unexpected error");
  }
});
