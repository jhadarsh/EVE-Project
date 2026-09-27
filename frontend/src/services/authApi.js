import { apiClient } from "./apiClient";
export const authApi = {
  signup: (body) => apiClient.post("/auth/signup", body),
  login: (body) => apiClient.post("/auth/login", body),
  verify: (body) => apiClient.post("/auth/verify", body),
  resendVerification: (body) => apiClient.post("/auth/resend-verification", body),
  me: () => apiClient.get("/auth/me"),
  logout: () => apiClient.post("/auth/logout", {}),
};