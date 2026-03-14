// src/api/client.ts
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/v1",
  headers: { "Content-Type": "application/json" },
});

// Inject JWT token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("multidb_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("multidb_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

// Helper to unwrap { data: T, meta: ... } envelope
export function unwrap<T>(response: { data: { data: T } }): T {
  return response.data.data;
}
