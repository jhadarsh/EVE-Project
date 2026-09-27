import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;
if (!baseURL) {
  console.warn("VITE_API_BASE_URL is not configured.");
}

export const apiClient = axios.create({
  baseURL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

export const getAccessToken = () => localStorage.getItem("eve_access_token");

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function normalizeApiError(error) {
  if (!error?.response) {
    return {
      status: 0,
      code: "NETWORK_ERROR",
      message:
        "Unable to reach the server. Check your connection and try again.",
    };
  }
  const { status, data } = error.response;
  const code = data?.code || "UNKNOWN_ERROR";
  const message = data?.message || "Something went wrong. Please try again.";
  const details = Array.isArray(data?.details) ? data.details : [];
  const map = {
    400: "Please check the information and try again.",
    401: "Your session is missing or expired. Please sign in again.",
    403: "You do not have permission to perform this action.",
    404: "The requested resource could not be found.",
    409: "That action conflicts with the current state. Refresh and try again.",
    429: "Too many requests. Please wait a moment and try again.",
    500: "The server encountered an error. Please try again shortly.",
  };
  return {
    status,
    code,
    message: map[status] || message,
    serverMessage: message,
    details,
  };
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    error.normalized = normalizeApiError(error);
    return Promise.reject(error);
  },
);
