import Medusa from "@medusajs/js-sdk";

export const backendUrl = __BACKEND_URL__ ?? "/";

// Publishable API key - required for all backend requests
const PUBLISHABLE_KEY = "pk_3e5434677a64beba278f80dfdd444cb978debabab7f445b20b2977233cd37c53";

const decodeJwt = (token: string) => {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));

    return decoded;
  } catch {
    return null;
  }
};

export const isTokenExpired = (token: string | null) => {
  if (!token) {
    return true;
  }

  const payload = decodeJwt(token);

  if (!payload?.exp) {
    return true;
  }

  return payload.exp * 1000 < Date.now();
};

export const getAuthToken = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem("mawgood_auth_token");
};

// Create SDK with publishable key
export const sdk = new Medusa({
  baseUrl: backendUrl,
  publishableApiKey: PUBLISHABLE_KEY,
});

// useful when you want to call the BE from the console and try things out quickly
if (typeof window !== "undefined") {
  (window as any).__sdk = sdk;
}
