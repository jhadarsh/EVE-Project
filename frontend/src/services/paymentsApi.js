import { apiClient } from "./apiClient";
export const paymentsApi = {
  create: (booking_id) => apiClient.post("/payments", { booking_id }),
  get: (id) => apiClient.get(`/payments/${id}`),
  status: (id) => apiClient.get(`/payments/${id}/status`),
};
