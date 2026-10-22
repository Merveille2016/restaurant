// MTN Mobile Money — Collections product (momodeveloper.mtn.com).
//
// Flow: OAuth2 token → POST /collection/v1_0/requesttopay (the customer
// receives a USSD push and confirms with their PIN) → poll
// GET /collection/v1_0/requesttopay/{reference} until a final status.
//
// Environment variables:
//   MTN_BASE_URL            sandbox: https://sandbox.momodeveloper.mtn.com
//                           production: the market URL given at onboarding
//   MTN_SUBSCRIPTION_KEY    Ocp-Apim-Subscription-Key (primary key)
//   MTN_API_USER            API user id (UUID)
//   MTN_API_KEY             API key paired with the API user
//   MTN_TARGET_ENVIRONMENT  "sandbox" in test; the production market name
//                           (given at merchant onboarding, e.g. for Cameroon)
//   MTN_CURRENCY            "EUR" in sandbox, "XAF" for Cameroon

const BASE_URL = (Deno.env.get("MTN_BASE_URL") ?? "https://sandbox.momodeveloper.mtn.com").replace(/\/+$/, "");
const SUBSCRIPTION_KEY = Deno.env.get("MTN_SUBSCRIPTION_KEY") ?? "";
const API_USER = Deno.env.get("MTN_API_USER") ?? "";
const API_KEY = Deno.env.get("MTN_API_KEY") ?? "";
const TARGET_ENV = Deno.env.get("MTN_TARGET_ENVIRONMENT") ?? "sandbox";
const CURRENCY = Deno.env.get("MTN_CURRENCY") ?? "EUR";

export function mtnConfigured(): boolean {
  return Boolean(SUBSCRIPTION_KEY && API_USER && API_KEY);
}

export class MtnError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MtnError";
  }
}

/** OAuth2 client-credentials token (Basic auth: API user / API key). */
export async function mtnToken(): Promise<string> {
  const basic = btoa(`${API_USER}:${API_KEY}`);
  const response = await fetch(`${BASE_URL}/collection/token/`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ grant_type: "client_credentials" }),
  });
  if (!response.ok) {
    throw new MtnError(`MTN token failed: HTTP ${response.status}`);
  }
  const body = await response.json();
  return body.access_token as string;
}

/** Normalizes a Cameroonian MSISDN to 237XXXXXXXXX. */
export function normalizeMsisdn(input: string): string | null {
  let digits = (input ?? "").replace(/[\s.-]/g, "").replace(/^\+/, "");
  if (/^\d{9}$/.test(digits) && digits.startsWith("6")) digits = `237${digits}`;
  if (/^237\d{9}$/.test(digits)) return digits;
  return null;
}

/**
 * Requests a payment. `reference` is the X-Reference-Id used later to poll
 * the status. Resolves when MTN accepts the request (HTTP 202) — the money
 * moves only after the customer confirms on their handset.
 */
export async function mtnRequestToPay(params: {
  reference: string;
  amount: number;
  msisdn: string;
  externalId: string;
  message: string;
}): Promise<void> {
  const token = await mtnToken();
  const response = await fetch(`${BASE_URL}/collection/v1_0/requesttopay`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Reference-Id": params.reference,
      "X-Target-Environment": TARGET_ENV,
      "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: String(params.amount),
      currency: CURRENCY,
      externalId: params.externalId,
      payer: { partyIdType: "MSISDN", partyId: params.msisdn },
      payerMessage: params.message,
      payeeNote: params.message,
    }),
  });
  if (response.status !== 202) {
    const detail = await response.text();
    throw new MtnError(`MTN requesttopay failed: HTTP ${response.status} ${detail}`);
  }
}

export type MtnStatus =
  | "PENDING"
  | "SUCCESSFUL"
  | "FAILED"
  | "TIMEOUT"
  | "REJECTED";

/** Polls the status of a requesttopay previously created with `reference`. */
export async function mtnGetStatus(reference: string): Promise<MtnStatus> {
  const token = await mtnToken();
  const response = await fetch(
    `${BASE_URL}/collection/v1_0/requesttopay/${encodeURIComponent(reference)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Target-Environment": TARGET_ENV,
        "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY,
      },
    },
  );
  if (!response.ok) {
    throw new MtnError(`MTN status failed: HTTP ${response.status}`);
  }
  const body = await response.json();
  return body.status as MtnStatus;
}
