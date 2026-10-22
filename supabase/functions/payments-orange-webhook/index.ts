// Orange Money payment notification (webhook).
//
// Orange POSTs the final status here after the customer confirms (or fails)
// on the payment page. The notif_token received must match the one stored
// when the session was created — that token is the only proof the call is
// genuine, so it is compared before anything is updated.
//
// Always answers 200 so Orange does not retry indefinitely.

import { json } from "../_shared/cors.ts";
import { findOrderByNotifToken, updateOrder, type Order } from "../_shared/supabase.ts";
import { notifyOrder } from "../_shared/notify.ts";

Deno.serve(async (request) => {
  try {
    const body = await request.json().catch(() => null);
    const status = typeof body?.status === "string" ? body.status : "";
    const notifToken = typeof body?.notif_token === "string" ? body.notif_token : "";
    const txnid = typeof body?.txnid === "string" ? body.txnid : "";

    if (!notifToken) return json({ error: "missing notif_token" }, 200);

    const order: Order | null = await findOrderByNotifToken(notifToken);
    if (!order) return json({ error: "unknown notif_token" }, 200);

    if (order.payment_status === "paid") return json({ ok: true, status: "paid" });

    if (status === "SUCCESS") {
      await updateOrder(order.id, {
        payment_status: "paid",
        status: order.status === "new" ? "confirmed" : order.status,
        payment_ref: txnid || order.payment_ref,
      });
      order.payment_status = "paid";
      await notifyOrder(order);
      return json({ ok: true, status: "paid" });
    }

    if (status === "FAILED" || status === "EXPIRED") {
      await updateOrder(order.id, { payment_status: "failed" });
      return json({ ok: true, status: "failed" });
    }

    return json({ ok: true, status: "pending" });
  } catch (error) {
    console.error(error);
    return json({ error: "unexpected error" }, 200);
  }
});
