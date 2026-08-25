import { apiRequest } from "./client";

const baseUrl = import.meta.env.VITE_USER_API_URL || "/user-api";

export const documentApi = {
  list: () => apiRequest(baseUrl, "/api/document"),
  upload: (body) => apiRequest(baseUrl, "/api/document", { method: "POST", body }),
  remove: (id) => apiRequest(baseUrl, `/api/document/${id}`, { method: "DELETE" }),
};
