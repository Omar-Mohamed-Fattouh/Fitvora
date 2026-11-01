import axios from "axios";

const rawBase = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");
const baseURL = /^https?:\/\//.test(rawBase) && !rawBase.endsWith("/api")
  ? `${rawBase}/api`
  : rawBase;

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  const lang = localStorage.getItem("fitvora-lang") || "en";
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers["Accept-Language"] = lang;
  if (config.data && typeof config.data === "object" && !Array.isArray(config.data) && !config.data.locale) {
    config.data = { ...config.data, locale: lang };
  }
  return config;
});

export default api;
