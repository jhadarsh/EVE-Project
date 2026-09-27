import { apiClient } from "./apiClient";
const params = (p) =>
  Object.fromEntries(
    Object.entries(p || {}).filter(([, v]) => v !== undefined && v !== ""),
  );
export const bookingsApi = {
  create: (body) => apiClient.post("/bookings", body),
  list: (p) => apiClient.get("/bookings", { params: params(p) }),
  get: (id) => apiClient.get(`/bookings/${id}`),
  cancel: (id, body = {}) => apiClient.post(`/bookings/${id}/cancel`, body),
};
