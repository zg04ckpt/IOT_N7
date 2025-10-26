import axios, { AxiosInstance } from "axios";

const BASE_URL = "http://10.0.2.2:4000/api";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
