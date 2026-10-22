// Polls the Orange Money transaction status for an order (webhook fallback).
//
// Body: { order_id: string }
// Called by the checkout page after the customer comes back from the Orange
// payment page, in case the webhook is delayed or was missed.

import { preflight, json, badRequest, serverError } from "../_shared/cors.ts";
import { getOrder, updateOrder } from "../_shared/supabase.ts";
import { orangeTransactionStatus, OrangeError } from "../_shared/orange.ts";
import { notifyOrder } from "../_shared/notify.ts";

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return preflight();
  if (request.method !== "POST") return badRequest("POST only");

  try {
    const body = await request.json().catch(() => null);
    const orderId = typeof body?.order_id === "string" ? body.order_id : "";
    if (!orderId) return badRequest("order_id is required");

    const order = await getOrder(orderId);
    if (!order || !order.payment_token) return badRequest("No Orange payment in progress");

    if (order.payment_status === "paid") return json({ payment_status: "paid" });
    if (order.payment_status === "failed") return json({ payment_status: "failed" });

    const result = await orangeTransactionStatus({
      orderId,
      amount: order.total_fcfa ?? 0,
      payToken: order.payment_token,
    });

    if (result.status === "SUCCESS") {
      await updateOrder(orderId, {
        payment_status: "paid",
        status: order.status === "new" ? "confirmed" : order.status,
        payment_ref: result.txnid || order.payment_ref,
      });
      order.payment_status = "paid";
      await notifyOrder(order);
      return json({ payment_status: "paid" });
    }

    if (result.status === "FAILED" || result.status === "EXPIRED") {
      await updateOrder(orderId, { payment_status: "failed" });
      return json({ payment_status: "failed", orange_status: result.status });
    }

    return json({ payment_status: "pending", orange_status: result.status });
  } catch (error) {
    if (error instanceof OrangeError) return serverError(error.message);
    console.error(error);
    return serverError("Unexpected error");
  }
});
