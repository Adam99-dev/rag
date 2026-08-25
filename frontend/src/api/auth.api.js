import { apiRequest } from "./client";

const baseUrl = import.meta.env.VITE_USER_API_URL || "/user-api";
const json = (body) => ({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

export const authApi = {
  me: () => apiRequest(baseUrl, "/api/auth/me"),
  login: (body) => apiRequest(baseUrl, "/api/auth/login", json(body)),
  signup: (body) => apiRequest(baseUrl, "/api/auth/signup", json(body)),
  logout: () => apiRequest(baseUrl, "/api/auth/logout", { method: "POST" }),
};
