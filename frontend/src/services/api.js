import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true
});

api.interceptors.request.use((config) => {
  // Token is handled via httpOnly cookie, no need to inject header
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem("user"); // Keep user info cleanup
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
