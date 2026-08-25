import { apiRequest } from "./client";

const CHAT_API_URL = import.meta.env.VITE_CHAT_API_URL || "/chat-api";

export const chatApi = {
  send: (body) => apiRequest(CHAT_API_URL, "/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
};
