import { apiRequest } from "./client";

const userUrl = import.meta.env.VITE_USER_API_URL || "/user-api";

export const chatApi = {
  get: (id) => apiRequest(userUrl, `/api/chat/${id}`),
  send: (body) => apiRequest(userUrl, "/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
};
