import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8200/api/v1";

export const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const saved = localStorage.getItem("abrams_auth");
  if (saved) {
    const { token } = JSON.parse(saved);
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }
  return config;
});
