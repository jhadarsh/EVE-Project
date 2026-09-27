import { apiClient } from "./apiClient";
const params = (p) =>
  Object.fromEntries(
    Object.entries(p || {}).filter(([, v]) => v !== undefined && v !== ""),
  );
export const logsApi = {
  list: (p) => apiClient.get("/logs", { params: params(p) }),
};
