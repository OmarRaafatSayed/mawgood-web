import { FetchError } from "@medusajs/js-sdk"
import { HttpTypes } from "@medusajs/types"
import { UseMutationOptions, useMutation } from "@tanstack/react-query"
import { fetchQuery, backendUrl, publishableApiKey } from "../../lib/client"

export const useSignInWithEmailPass = (
  options?: UseMutationOptions<
    | string
    | {
        location: string
      },
    FetchError,
    HttpTypes.AdminSignUpWithEmailPassword
  >
) => {
  return useMutation({
    mutationFn: async (payload) => {
      // Direct fetch to avoid fetchQuery auth header issues
      const response = await fetch(`${backendUrl}/auth/seller/emailpass`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": publishableApiKey || 'pk_3e5434677a64beba278f80dfdd444cb978debabab7f445b20b2977233cd37c53',
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.message || "Login failed");
        (error as any).status = response.status;
        throw error;
      }

      const data = await response.json();
      
      if (data && data.token) {
        localStorage.setItem("medusa_auth_token", data.token);
        console.log("[Auth] Token stored:", data.token.substring(0, 20) + "...");
      } else {
        console.error("[Auth] No token in response:", data);
        throw new Error("No token received from login");
      }
      
      return data;
    },
    onSuccess: async (data, variables, context) => {
      console.log("[Auth] Login successful, redirecting...");
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error) => {
      console.error("[Auth] Login failed:", error.message);
      options?.onError?.(error);
    },
    ...options,
  });
}

export const useSignUpWithEmailPass = (
  options?: UseMutationOptions<
    string,
    FetchError,
    HttpTypes.AdminSignInWithEmailPassword & {
      confirmPassword: string
      name: string
    }
  >
) => {
  return useMutation({
    mutationFn: async (payload) => {
      // 1. Register auth
      await fetch(`${backendUrl}/auth/seller/emailpass/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": publishableApiKey || 'pk_3e5434677a64beba278f80dfdd444cb978debabab7f445b20b2977233cd37c53',
        },
        body: JSON.stringify({
          email: payload.email,
          password: payload.password,
        }),
        credentials: "include",
      });

      // 2. Create seller with instant approval
      const seller = {
        name: payload.name,
        approved: true,
        member: {
          name: payload.name,
          email: payload.email,
        },
      };
      
      await fetchQuery("/vendor/sellers", {
        method: "POST",
        body: seller,
      });

      // 3. Auto-login
      const response = await fetch(`${backendUrl}/auth/seller/emailpass`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": publishableApiKey || 'pk_3e5434677a64beba278f80dfdd444cb978debabab7f445b20b2977233cd37c53',
        },
        body: JSON.stringify({
          email: payload.email,
          password: payload.password,
        }),
        credentials: "include",
      });

      const data = await response.json();
      if (data.token) {
        localStorage.setItem("medusa_auth_token", data.token);
      }
      
      return data.token as string;
    },
    ...options,
  });
}

export const useSignUpForInvite = (
  options?: UseMutationOptions<
    string,
    FetchError,
    HttpTypes.AdminSignInWithEmailPassword
  >
) => {
  return useMutation({
    mutationFn: (payload) => fetchQuery("/auth/seller/emailpass/register", {
      method: "POST",
      body: payload,
    }),
    ...options,
  });
}

export const useResetPasswordForEmailPass = (
  options?: UseMutationOptions<void, FetchError, { email: string }>
) => {
  return useMutation({
    mutationFn: async (payload) => {
      await fetch(`${backendUrl}/auth/seller/emailpass/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": publishableApiKey || 'pk_3e5434677a64beba278f80dfdd444cb978debabab7f445b20b2977233cd37c53',
        },
        body: JSON.stringify({
          identifier: payload.email,
        }),
        credentials: "include",
      });
    },
    onSuccess: async (data, variables, context) => {
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}

export const useLogout = (options?: UseMutationOptions<void, FetchError>) => {
  return useMutation({
    mutationFn: async () => {
      localStorage.removeItem("medusa_auth_token");
      window.location.href = "/login";
    },
    ...options,
  });
}

export const useUpdateProviderForEmailPass = (
  token: string,
  options?: UseMutationOptions<void, FetchError, { password: string }>
) => {
  return useMutation({
    mutationFn: (payload) =>
      fetchQuery("/auth/seller/emailpass/update", {
        method: "POST",
        body: payload,
      }),
    onSuccess: async (data, variables, context) => {
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}
