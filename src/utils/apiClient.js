const DEFAULT_API_BASE_URL = "http://localhost:3000";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;
const AUTH_TOKEN_KEY = "finsight_auth_token";
const AUTH_USER_KEY = "finsight_auth_user";

export const getStoredAuthSession = () => {
  if (typeof window === "undefined") {
    return { token: null, user: null };
  }

  const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
  const userRaw = window.localStorage.getItem(AUTH_USER_KEY);

  return {
    token,
    user: userRaw
      ? (() => {
          try {
            return JSON.parse(userRaw);
          } catch {
            return null;
          }
        })()
      : null,
  };
};

export const setStoredAuthSession = ({ token, user }) => {
  if (typeof window === "undefined") {
    return;
  }

  if (token) {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
  }

  if (user) {
    window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(AUTH_USER_KEY);
  }
};

export const clearStoredAuthSession = () => {
  setStoredAuthSession({ token: null, user: null });
};

export const getApiBaseUrl = () => API_BASE_URL.replace(/\/$/, "");

export const apiRequest = async (path, { token, headers, ...options } = {}) => {
  const isFormDataBody = typeof FormData !== "undefined" && options?.body instanceof FormData;

  const response = await fetch(`${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`, {
    credentials: "include",
    ...options,
    headers: {
      ...(isFormDataBody ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const message = payload?.message || payload?.error || "Request failed";
    if (Array.isArray(payload?.errors) && payload.errors.length > 0) {
      throw new Error(payload.errors.join(". "));
    }
    throw new Error(message);
  }

  return payload;
};
