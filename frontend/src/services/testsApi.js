import { apiClient } from "./apiClient";

const params = (p) =>
  Object.fromEntries(
    Object.entries(p || {}).filter(
      ([, v]) => v !== undefined && v !== ""
    )
  );

export const testsApi = {
  list: (p) =>
    apiClient.get("/tests", {
      params: params(p),
    }),

  get: (id) =>
    apiClient.get(`/tests/${id}`),

  create: (body) =>
    apiClient.post("/tests", body),

  update: (id, body) =>
    apiClient.patch(`/tests/${id}`, body),

  // NEW / FIXED
  getCentres: (testId, p) =>
    apiClient.get(`/tests/${testId}/centres`, {
      params: params(p),
    }),
};