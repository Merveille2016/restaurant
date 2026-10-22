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
