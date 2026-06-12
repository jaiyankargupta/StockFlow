import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? "/api/v1";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

const storedToken = localStorage.getItem("sf_token");
if (storedToken) {
  apiClient.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 500) {
      console.error("Server error:", error.response?.data);
    }
    return Promise.reject(error);
  },
);
