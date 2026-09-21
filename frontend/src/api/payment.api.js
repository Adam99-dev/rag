import { apiRequest } from "./client";

const baseUrl = import.meta.env.VITE_USER_API_URL || "/user-api";
const json = (body) => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export const paymentApi = {
  getPrice: () => apiRequest(baseUrl, "/api/payment/price", { method: "GET" }),
  addCard: (body) => apiRequest(baseUrl, "/api/payment/add-card", json(body)),
  createCharge: (body) =>
    apiRequest(baseUrl, "/api/payment/create-charges", json(body)),
};
