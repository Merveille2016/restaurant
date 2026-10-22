// Manager authentication through the Supabase Auth REST API — no
// supabase-js dependency (see README), just fetch calls with the anon key.
// The session lives in localStorage; expired access tokens are refreshed
// transparently by src/admin/api.js.

import { supabaseConfigured } from "../supabase.js";

const SESSION_KEY = "mgh-admin-session";

function credentials() {
  return {
    baseUrl: import.meta.env.VITE_SUPABASE_URL.replace(/\/+$/, ""),
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  };
}

function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && parsed.access_token && parsed.refresh_token ? parsed : null;
  } catch {
    return null;
  }
}

function writeSession(session) {
  try {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    // Private browsing: the session just won't persist.
  }
}

async function tokenRequest(grantType, body) {
  const { baseUrl, anonKey } = credentials();
  const response = await fetch(`${baseUrl}/auth/v1/token?grant_type=${grantType}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: anonKey },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(message || `HTTP ${response.status}`);
  }
  return response.json();
}

/** Signs the manager in. Returns the session (also stored). */
export async function adminSignIn(email, password) {
  const session = await tokenRequest("password", { email, password });
  writeSession(session);
  return session;
}

/** Refreshes the stored session; returns null when it cannot be renewed. */
export async function adminRefresh() {
  const session = readSession();
  if (!session) return null;
  try {
    const next = await tokenRequest("refresh_token", { refresh_token: session.refresh_token });
    writeSession(next);
    return next;
  } catch {
    writeSession(null);
    return null;
  }
}

/** Current session, refreshed on demand when the access token has expired. */
export async function adminSession() {
  if (!supabaseConfigured()) return null;
  const session = readSession();
  if (!session) return null;
  const expiresAt = (session.expires_at ?? 0) * 1000;
  if (expiresAt - 60_000 > Date.now()) return session;
  return adminRefresh();
}

/** Signs the manager out (revokes the refresh token, clears storage). */
export async function adminSignOut() {
  const session = readSession();
  writeSession(null);
  if (!session) return;
  try {
    const { baseUrl, anonKey } = credentials();
    await fetch(`${baseUrl}/auth/v1/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: anonKey,
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ refresh_token: session.refresh_token }),
    });
  } catch {
    // Network failures during sign-out are irrelevant — storage is cleared.
  }
}

/** The signed-in user's email, or null. */
export function adminEmail() {
  return readSession()?.user?.email ?? null;
}

/**
 * Asks Supabase to email a password-reset link. Supabase answers the same
 * way whether or not the address exists, so callers must not reveal which.
 */
export async function adminRequestReset(email, redirectTo) {
  const { baseUrl, anonKey } = credentials();
  const query = redirectTo ? `?redirect_to=${encodeURIComponent(redirectTo)}` : "";
  const response = await fetch(`${baseUrl}/auth/v1/recover${query}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: anonKey },
    body: JSON.stringify({ email }),
  });
  if (!response.ok && response.status !== 429) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.status !== 429;
}

/**
 * Reads the one-time sign-in that Supabase appends to the URL hash after a
 * recovery or invite link (#access_token=…&type=recovery). Stores the
 * session, clears the hash, and returns { type } — or { error } when the
 * link is expired or already used — or null when there is nothing to read.
 */
export async function consumeAuthRedirect() {
  if (typeof window === "undefined" || !window.location.hash) return null;
  const params = new URLSearchParams(window.location.hash.slice(1));
  const accessToken = params.get("access_token");
  const error = params.get("error_description") || params.get("error");
  if (!accessToken && !error) return null;

  window.history.replaceState(null, "", window.location.pathname + window.location.search);
  if (error) return { error };

  const { baseUrl, anonKey } = credentials();
  const response = await fetch(`${baseUrl}/auth/v1/user`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) return { error: `HTTP ${response.status}` };
  const user = await response.json();
  const expiresIn = Number(params.get("expires_in") || 3600);
  writeSession({
    access_token: accessToken,
    refresh_token: params.get("refresh_token"),
    expires_at: Number(params.get("expires_at")) || Math.floor(Date.now() / 1000) + expiresIn,
    user,
  });
  return { type: params.get("type") || "magiclink" };
}

/** Sets a new password for the signed-in user (after a recovery link). */
export async function adminUpdatePassword(password) {
  const session = await adminSession();
  if (!session) throw new Error("No session");
  const { baseUrl, anonKey } = credentials();
  const response = await fetch(`${baseUrl}/auth/v1/user`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      apikey: anonKey,
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ password }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const error = new Error(body.msg || body.message || `HTTP ${response.status}`);
    error.code = body.error_code || body.code;
    throw error;
  }
}
