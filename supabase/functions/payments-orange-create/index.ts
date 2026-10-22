// Creates an Orange Money web-payment session for an online order.
//
// Body: { order_id: string, lang?: "fr" | "en", origin?: string }
// Returns { payment_url } — the checkout redirects the customer there to
// confirm with an OTP (#150# or the Max it app). Orange then POSTs the
// final status to payments-orange-webhook; the customer's browser also
// comes back to /commande?order=…&payment=orange which polls
// payments-orange-check as a fallback.

import { preflight, json, badRequest, serverError } from "../_shared/cors.ts";
import { getOrder, updateOrder } from "../_shared/supabase.ts";
import { orangeCreateSession, orangeConfigured, OrangeError } from "../_shared/orange.ts";

const MAX_ORDER_AGE_MS = 24 * 60 * 60 * 1000;

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return preflight();
  if (request.method !== "POST") return badRequest("POST only");

  try {
    if (!orangeConfigured()) {
      return serverError("Orange Money is not configured (missing secrets)");
    }

    const body = await request.json().catch(() => null);
    const orderId = typeof body?.order_id === "string" ? body.order_id : "";
    const lang = body?.lang === "en" ? "en" : "fr";
    const clientOrigin = typeof body?.origin === "string" ? body.origin : "";
    if (!orderId) return badRequest("order_id is required");

    const order = await getOrder(orderId);
    if (!order) return badRequest("Unknown order");
    if (order.source !== "online") return badRequest("Not an online order");
    if (order.payment_method !== "orange") return badRequest("Order is not an Orange Money order");
    if (order.payment_status === "paid") return json({ ok: true, status: "paid" });
    if (Date.now() - Date.parse(order.created_at) > MAX_ORDER_AGE_MS) {
      return badRequest("Order is too old to be paid");
    }

    // SITE_URL (the deployed site) takes precedence; the caller's origin is
    // the local-development fallback.
    const siteUrl = (Deno.env.get("SITE_URL") ?? clientOrigin).replace(/\/+$/, "");
    const supabaseUrl = (Deno.env.get("SUPABASE_URL") ?? "").replace(/\/+$/, "");

    const session = await orangeCreateSession({
      orderId,
      amount: order.total_fcfa ?? 0,
      returnUrl: `${siteUrl}/commande?order=${orderId}&payment=orange&state=return`,
      cancelUrl: `${siteUrl}/commande?order=${orderId}&payment=orange&state=cancel`,
      notifUrl: `${supabaseUrl}/functions/v1/payments-orange-webhook`,
      lang,
    });

    await updateOrder(orderId, {
      payment_ref: orderId,
      payment_token: session.payToken,
      notif_token: session.notifToken,
      payment_status: "pending",
    });

    return json({ ok: true, payment_url: session.paymentUrl });
  } catch (error) {
    if (error instanceof OrangeError) return serverError(error.message);
    console.error(error);
    return serverError("Unexpected error");
  }
});
