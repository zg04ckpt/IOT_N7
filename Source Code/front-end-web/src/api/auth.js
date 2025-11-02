import axios from "../utils/axios";
import { endpoints } from "../constants/apiEndpoints";

export const checkIn = async (data) => {
  const URL = endpoints.checkIn;
  const res = await axios.post(URL, data);
  return res;
};

export const checkOut = async (id) => {
  const URL = `${endpoints.checkOut}/${id}`;
  const res = await axios.post(URL);
  return res;
};

export const loginUser = async (data) => {
  const URL = `${endpoints.auth}/login`;
  const res = await axios.post(URL, data);
  return res;
};

export const logoutUser = async () => {
  const URL = `${endpoints.auth}/logout`;
  const res = await axios.post(URL);
  return res;
};

export const getCurrentUser = async () => {
  const URL = `${endpoints.auth}/me`;
  const res = await axios.get(URL);
  return res;
};
