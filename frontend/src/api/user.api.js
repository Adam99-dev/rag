import { apiRequest } from "./client";

const baseUrl = import.meta.env.VITE_USER_API_URL || "/user-api";

export const userApi = {
  me: () => apiRequest(baseUrl, "/api/auth/me"),
};
