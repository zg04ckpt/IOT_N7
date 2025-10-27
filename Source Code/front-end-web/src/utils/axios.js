import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: "15000",
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
        console.error(
          "401 Unauthorized: Session đã hết hạn hoặc chưa đăng nhập."
        );
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
      if (status === 403) {
        console.error(
          "403 Forbidden: Bạn không có quyền truy cập tài nguyên này."
        );
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
