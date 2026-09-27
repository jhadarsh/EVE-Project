import { apiClient } from "./apiClient";

const params = (p) =>
  Object.fromEntries(
    Object.entries(p || {}).filter(
      ([, v]) => v !== undefined && v !== ""
    )
  );

export const centresApi = {
  list: (p) =>
    apiClient.get("/centres", {
      params: params(p),
    }),

  get: (id) =>
    apiClient.get(`/centres/${id}`),

  tests: (id, p) =>
    apiClient.get(`/centres/${id}/tests`, {
      params: params(p),
    }),

  slots: (id, p) =>
    apiClient.get(`/centres/${id}/slots`, {
      params: params(p),
    }),

  create: (body) =>
    apiClient.post("/centres", body),

  update: (id, body) =>
    apiClient.patch(`/centres/${id}`, body),

  // NEW
  addTest: (centreId, body) =>
    apiClient.post(`/centres/${centreId}/tests`, body),
};