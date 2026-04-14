import Medusa from '@medusajs/js-sdk';

export const backendUrl = __BACKEND_URL__ ?? '/';
export const publishableApiKey = __PUBLISHABLE_API_KEY__ ?? 'pk_3e5434677a64beba278f80dfdd444cb978debabab7f445b20b2977233cd37c53';

// Hardcode the publishable key as fallback
const finalPublishableKey = publishableApiKey || 'pk_3e5434677a64beba278f80dfdd444cb978debabab7f445b20b2977233cd37c53';

const decodeJwt = (token: string) => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch (err) {
    return null;
  }
};

const isTokenExpired = (token: string | null) => {
  if (!token) return true;
  const payload = decodeJwt(token);
  if (!payload?.exp) return true;
  return payload.exp * 1000 < Date.now();
};

export const sdk = new Medusa({
  baseUrl: backendUrl,
  publishableApiKey: finalPublishableKey,
  auth: {
    type: "session",
  },
});

// useful when you want to call the BE from the console and try things out quickly
if (typeof window !== 'undefined') {
  (window as any).__sdk = sdk;
}

export const importProductsQuery = async (file: File) => {
  const token = window.localStorage.getItem('medusa_auth_token') || '';
  const formData = new FormData();
  formData.append('file', file);

  return await fetch(`${backendUrl}/vendor/products/import`, {
    method: 'POST',
    body: formData,
    headers: {
      authorization: `Bearer ${token}`,
      'x-publishable-api-key': finalPublishableKey
    }
  })
    .then(res => res.json())
    .catch(() => null);
};

export const uploadFilesQuery = async (files: any[]) => {
  const token = window.localStorage.getItem('medusa_auth_token') || '';
  const formData = new FormData();

  for (const { file } of files) {
    formData.append('files', file);
  }

  return await fetch(`${backendUrl}/vendor/uploads`, {
    method: 'POST',
    body: formData,
    headers: {
      authorization: `Bearer ${token}`,
      'x-publishable-api-key': finalPublishableKey
    }
  })
    .then(res => res.json())
    .catch(() => null);
};

export const fetchQuery = async (
  url: string,
  {
    method,
    body,
    query,
    headers
  }: {
    method: 'GET' | 'POST' | 'DELETE';
    body?: object;
    query?: Record<string, string | number | object>;
    headers?: { [key: string]: string };
  }
) => {
  const bearer = window.localStorage.getItem('medusa_auth_token') || '';
  
  console.log("[fetchQuery] URL:", url);
  console.log("[fetchQuery] Token in localStorage:", bearer ? "YES (" + bearer.length + " chars)" : "NO");
  console.log("[fetchQuery] Full token:", bearer);
  console.log("[fetchQuery] Publishable key:", publishableApiKey);
  
  const params = Object.entries(query || {}).reduce((acc, [key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        // Send arrays as multiple query parameters with bracket notation
        // This allows backends to parse them as arrays: status[]=draft&status[]=published
        const arrayParams = value
          .map(item => `${encodeURIComponent(key)}[]=${encodeURIComponent(item)}`)
          .join('&');
        if (acc) {
          acc += '&' + arrayParams;
        } else {
          acc = arrayParams;
        }
      } else {
        const separator = acc ? '&' : '';
        const serializedValue = typeof value === 'object' ? JSON.stringify(value) : value;
        acc += `${separator}${encodeURIComponent(key)}=${encodeURIComponent(serializedValue)}`;
      }
    }
    return acc;
  }, '');
  
  const response = await fetch(`${backendUrl}${url}${params && `?${params}`}`, {
    method: method,
    credentials: 'include', // Use cookies for auth!
    headers: {
      authorization: `Bearer ${bearer}`,
      'Content-Type': 'application/json',
      'x-publishable-api-key': publishableApiKey,
      ...headers
    },
    body: body ? JSON.stringify(body) : null
  });

  console.log("[fetchQuery] Response:", response.status, url);
  console.log("[fetchQuery] Sent headers - Auth:", bearer ? bearer.substring(0, 30) + "..." : "NONE", "PubKey:", publishableApiKey ? publishableApiKey.substring(0, 20) + "..." : "NONE");

  if (!response.ok) {
    const errorData = await response.json();
    console.log("[fetchQuery] Error:", response.status, errorData);

    if (response.status === 401) {
      // Check if token is expired
      const currentToken = window.localStorage.getItem('medusa_auth_token');
      if (isTokenExpired(currentToken)) {
        console.log("[fetchQuery] Token expired, clearing");
        localStorage.removeItem('medusa_auth_token');
      }
      
      throw {
        type: 'NO_PERMISSION',
        message: errorData.message || 'Unauthorized',
        status: 401
      };
    }

    const error = new Error(errorData.message || 'Server error');
    (error as Error & { status: number }).status = response.status;
    throw error;
  }

  return response.json();
};
