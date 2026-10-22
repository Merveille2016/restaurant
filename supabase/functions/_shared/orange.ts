// Orange Money — Web Payment API (developer.orange.com, product om-webpay).
//
// Flow: OAuth2 token → POST /orange-money-webpay/{country}/v1/webpayment
// (returns a payment_url + pay_token + notif_token) → the customer confirms
// on the Orange payment page (OTP via #150#) → Orange POSTs the final status
// to our notif_url (payments-orange-webhook). The transactionstatus endpoint
// is the polling fallback.
//
// Environment variables:
//   ORANGE_BASE_URL      https://api.orange.com (production)
//   ORANGE_CLIENT_ID     consumer key from the Orange developer console
//   ORANGE_CLIENT_SECRET consumer secret
//   ORANGE_MERCHANT_KEY  merchant key issued with the OM contract
//   ORANGE_COUNTRY_CODE  "dev" in sandbox, "cm" for Cameroon in production
//   ORANGE_CURRENCY      "XAF" for Cameroon

const BASE_URL = (Deno.env.get("ORANGE_BASE_URL") ?? "https://api.orange.com").replace(/\/+$/, "");
const CLIENT_ID = Deno.env.get("ORANGE_CLIENT_ID") ?? "";
const CLIENT_SECRET = Deno.env.get("ORANGE_CLIENT_SECRET") ?? "";
const MERCHANT_KEY = Deno.env.get("ORANGE_MERCHANT_KEY") ?? "";
const COUNTRY = Deno.env.get("ORANGE_COUNTRY_CODE") ?? "dev";
const CURRENCY = Deno.env.get("ORANGE_CURRENCY") ?? "XAF";

export function orangeConfigured(): boolean {
  return Boolean(CLIENT_ID && CLIENT_SECRET && MERCHANT_KEY);
}

export class OrangeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrangeError";
  }
}

function apiPath(endpoint: string): string {
  return `${BASE_URL}/orange-money-webpay/${COUNTRY}/v1/${endpoint}`;
}

/** OAuth2 client-credentials token (Basic auth: client id / secret). */
export async function orangeToken(): Promise<string> {
  const basic = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
  const response = await fetch(`${BASE_URL}/oauth/v3/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: "grant_type=client_credentials",
  });
  if (!response.ok) {
    throw new OrangeError(`Orange token failed: HTTP ${response.status}`);
  }
  const body = await response.json();
  return body.access_token as string;
}

export interface OrangeSession {
  paymentUrl: string;
  payToken: string;
  notifToken: string;
}

/** Creates a web-payment session for an order. */
export async function orangeCreateSession(params: {
  orderId: string;
  amount: number;
  returnUrl: string;
  cancelUrl: string;
  notifUrl: string;
  lang: string;
}): Promise<OrangeSession> {
  const token = await orangeToken();
  const response = await fetch(apiPath("webpayment"), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      merchant_key: MERCHANT_KEY,
      currency: CURRENCY,
      order_id: params.orderId,
      amount: params.amount,
      return_url: params.returnUrl,
      cancel_url: params.cancelUrl,
      notif_url: params.notifUrl,
      lang: params.lang,
      reference: `Commande ${params.orderId.slice(0, 8).toUpperCase()}`,
    }),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new OrangeError(`Orange webpayment failed: HTTP ${response.status} ${detail}`);
  }
  const body = await response.json();
  if (!body.payment_url || !body.pay_token) {
    throw new OrangeError("Orange webpayment: unexpected response");
  }
  return {
    paymentUrl: body.payment_url as string,
    payToken: body.pay_token as string,
    notifToken: (body.notif_token ?? "") as string,
  };
}

export type OrangeStatus = "INITIATED" | "PENDING" | "EXPIRED" | "SUCCESS" | "FAILED";

/** Polls the transaction status (fallback when the webhook is delayed). */
export async function orangeTransactionStatus(params: {
  orderId: string;
  amount: number;
  payToken: string;
}): Promise<{ status: OrangeStatus; txnid?: string }> {
  const token = await orangeToken();
  const response = await fetch(apiPath("transactionstatus"), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      order_id: params.orderId,
      amount: params.amount,
      pay_token: params.payToken,
    }),
  });
  if (!response.ok) {
    throw new OrangeError(`Orange transactionstatus failed: HTTP ${response.status}`);
  }
  const body = await response.json();
  return {
    status: body.status as OrangeStatus,
    txnid: body.txnid as string | undefined,
  };
}
