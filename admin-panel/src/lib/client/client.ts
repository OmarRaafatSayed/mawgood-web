import Medusa from "@medusajs/js-sdk";

// ── Backend URL strategy ──────────────────────────────────────────────────────
// In production: use the full backend URL baked at build time
// In development: use localhost:9000 directly (Vite proxy handles /api)
const getBackendUrl = (): string => {
  // __BACKEND_URL__ is baked by vite.config.mts
  const baked = __BACKEND_URL__;

  // If it's a relative path like "/api", resolve it to a full URL
  if (baked && baked.startsWith("/")) {
    if (typeof window !== "undefined") {
      return `${window.location.origin}${baked}`;
    }
    return "http://localhost:9000";
  }

  return baked ?? "http://localhost:9000";
};

export const backendUrl = getBackendUrl();

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
