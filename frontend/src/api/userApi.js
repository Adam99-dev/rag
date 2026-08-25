import { apiRequest } from "./client";

const USER_API_URL = import.meta.env.VITE_USER_API_URL || "/user-api";

export const userApi = {
  me: () => apiRequest(USER_API_URL, "/api/auth/me"),
  login: (body) => apiRequest(USER_API_URL, "/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
  signup: (body) => apiRequest(USER_API_URL, "/api/auth/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
  logout: () => apiRequest(USER_API_URL, "/api/auth/logout", { method: "POST" }),
  documents: () => apiRequest(USER_API_URL, "/api/document"),
  upload: (body) => apiRequest(USER_API_URL, "/api/document", { method: "POST", body }),
  deleteDocument: (id) => apiRequest(USER_API_URL, `/api/document/${id}`, { method: "DELETE" }),
  chat: (id) => apiRequest(USER_API_URL, `/api/chat/${id}`),
};
