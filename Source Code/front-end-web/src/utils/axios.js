import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status } = error.response;
      if (status === 401) {
        const currentPath = window.location.pathname;
        if (currentPath !== "/login" && !currentPath.includes("/login")) {
          setTimeout(() => {
            if (window.location.pathname !== "/login") {
              window.location.href = "/login";
            }
          }, 100);
        }
      }
      if (status === 403) {
        console.error(
          "403 Forbidden: Bạn không có quyền truy cập tài nguyên này."
        );
        const currentPath = window.location.pathname;
        if (
          currentPath !== "/access-denied" &&
          !currentPath.includes("/access-denied")
        ) {
          setTimeout(() => {
            if (window.location.pathname !== "/access-denied") {
              window.location.href = "/access-denied";
            }
          }, 100);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
