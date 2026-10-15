import axios from "axios";

// Determine the live backend URL
const envUrl = import.meta.env.VITE_API_URL;
const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

// If VITE_API_URL is missing or contains the example placeholder 'verdantcare-backend.onrender.com'
const targetBaseURL =
  envUrl && !envUrl.includes("verdantcare-backend.onrender.com")
    ? envUrl
    : isLocalhost
    ? "http://localhost:8080/api"
    : "https://verdantcare-customer-support-system.onrender.com/api";

const API = axios.create({
  baseURL: targetBaseURL
});

// Attach JWT token to all outgoing requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Gracefully handle 401 Unauthorized responses
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("401 Unauthorized encountered from backend:", error.response?.data);

      // If user is accessing protected routes with an invalid or expired token
      const isAuthPage =
        window.location.pathname === "/login" ||
        window.location.pathname === "/register" ||
        window.location.pathname === "/";

      if (!isAuthPage) {
        localStorage.removeItem("token");
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }
    }
    return Promise.reject(error);
  }
);

export default API;
