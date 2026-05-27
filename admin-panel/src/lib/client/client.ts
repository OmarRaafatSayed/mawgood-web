import Medusa from "@medusajs/js-sdk";

// ── Reverse-proxy strategy ────────────────────────────────────────────────────
// __BACKEND_URL__ is always "/api" (baked in by vite.config.mts).
// In development, Vite proxies /api → localhost:9000.
// In production, Nginx proxies /api → localhost:9000.
// The bundle never contains a hard-coded domain, so the same dist/ works
// on any server without a rebuild.
export const backendUrl = __BACKEND_URL__ ?? "/api";

// Publishable API key — required for storefront/public API calls
const PUBLISHABLE_KEY =
  "pk_3e5434677a64beba278f80dfdd444cb978debabab7f445b20b2977233cd37c53";

// ── JWT helpers ───────────────────────────────────────────────────────────────

const decodeJwt = (token: string) => {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  const payload = decodeJwt(token);
  if (!payload?.exp) return true;
  return payload.exp * 1000 < Date.now();
};

export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("mawgood_auth_token");
};

// ── SDK instance ──────────────────────────────────────────────────────────────

export const sdk = new Medusa({
  baseUrl: backendUrl,
  publishableApiKey: PUBLISHABLE_KEY,
});

// Expose on window for quick console debugging in dev
if (typeof window !== "undefined") {
  (window as any).__sdk = sdk;
}
