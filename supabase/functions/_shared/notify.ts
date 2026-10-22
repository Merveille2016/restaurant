// Order notifications for the restaurant team.
//
// Channels, all optional (skipped silently when unconfigured):
//   * Email via Resend  — RESEND_API_KEY + NOTIFY_EMAIL_TO (+ NOTIFY_EMAIL_FROM)
//   * SMS via Termii    — TERMII_API_KEY + NOTIFY_SMS_TO (+ TERMII_SENDER_ID)
//
// The email is bilingual (FR first, the market language), matching the site.

import type { Order } from "./supabase.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const NOTIFY_EMAIL_TO = Deno.env.get("NOTIFY_EMAIL_TO") ?? "";
const NOTIFY_EMAIL_FROM = Deno.env.get("NOTIFY_EMAIL_FROM") ?? "Mialine Gifted Hands <onboarding@resend.dev>";
const TERMII_API_KEY = Deno.env.get("TERMII_API_KEY") ?? "";
const NOTIFY_SMS_TO = Deno.env.get("NOTIFY_SMS_TO") ?? "";
const TERMII_SENDER_ID = Deno.env.get("TERMII_SENDER_ID") ?? "Mialine";

function fcfa(amount: number | null): string {
  return `${(amount ?? 0).toLocaleString("fr-FR").replace(/\u202f/g, " ")} FCFA`;
}

function paymentLabel(method: string, fr: boolean): string {
  const map: Record<string, [string, string]> = {
    cash: ["Espèces à la livraison", "Cash on delivery"],
    mtn: ["MTN Mobile Money", "MTN Mobile Money"],
    orange: ["Orange Money", "Orange Money"],
  };
  const pair = map[method] ?? [method, method];
  return fr ? pair[0] : pair[1];
}

function buildEmail(order: Order): { subject: string; html: string } {
  const items = (order.order_items ?? [])
    .map((item) => {
      const name = item.name_fr || item.name_en;
      return `<tr><td>${item.qty} × ${name}</td><td style="text-align:right">${fcfa(item.line_total_fcfa)}</td></tr>`;
    })
    .join("");

  const subject =
    order.payment_status === "paid"
      ? `Commande payée ${fcfa(order.total_fcfa)} — ${order.customer_name}`
      : `Nouvelle commande — ${order.customer_name}`;

  const html = `
  <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#26302b">
    <h2 style="color:#1b4332">Mialine Gifted Hands — nouvelle commande</h2>
    <p><strong>Commande :</strong> ${order.id.slice(0, 8).toUpperCase()}</p>
    <table style="width:100%;border-collapse:collapse;margin:12px 0">
      <tr><td colspan="2" style="border-bottom:1px solid #e6e4dd;padding:4px 0"><strong>Articles</strong></td></tr>
      ${items}
      <tr><td style="padding-top:4px">Livraison (${order.zone_name_fr ?? "—"})</td><td style="text-align:right">${fcfa(order.delivery_fee_fcfa)}</td></tr>
      <tr><td style="padding-top:4px"><strong>Total</strong></td><td style="text-align:right"><strong>${fcfa(order.total_fcfa)}</strong></td></tr>
    </table>
    <p><strong>Paiement :</strong> ${paymentLabel(order.payment_method, true)} — ${order.payment_status}</p>
    <p><strong>Client :</strong> ${order.customer_name} — ${order.phone}</p>
    <p><strong>Lieu :</strong> ${order.location} (${order.zone_name_fr ?? "—"})</p>
    ${order.note ? `<p><strong>Note :</strong> ${order.note}</p>` : ""}
    <p style="color:#5f6b64;font-size:0.9em">New order — total ${fcfa(order.total_fcfa)} from ${order.customer_name} (${order.phone}), ${paymentLabel(order.payment_method, false)}.</p>
  </div>`;

  return { subject, html };
}

async function sendEmail(order: Order): Promise<void> {
  if (!RESEND_API_KEY || !NOTIFY_EMAIL_TO) return;
  const { subject, html } = buildEmail(order);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: NOTIFY_EMAIL_FROM, to: [NOTIFY_EMAIL_TO], subject, html }),
  });
  if (!response.ok) {
    console.error("notify: Resend error", response.status, await response.text());
  }
}

async function sendSms(order: Order): Promise<void> {
  if (!TERMII_API_KEY || !NOTIFY_SMS_TO) return;
  const text =
    `Nouvelle commande ${order.id.slice(0, 8).toUpperCase()} — ${order.customer_name} — ` +
    `${fcfa(order.total_fcfa)} — ${order.location}.`;
  const response = await fetch("https://api.ng.termii.com/api/sms/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: TERMII_API_KEY,
      to: NOTIFY_SMS_TO,
      from: TERMII_SENDER_ID,
      sms: text,
      type: "plain",
      channel: "generic",
    }),
  });
  if (!response.ok) {
    console.error("notify: Termii error", response.status, await response.text());
  }
}

/** Notifies the restaurant about an order. Never throws. */
export async function notifyOrder(order: Order): Promise<void> {
  try {
    await Promise.allSettled([sendEmail(order), sendSms(order)]);
  } catch (error) {
    console.error("notify: failed", error);
  }
}
