import axios from "../utils/axios";
import { endpoints } from "../constants/apiEndpoints";

export const login = async (data) => {
  const URL = `${endpoints.user.login}`;
  const response = await axios.post(URL, data);
  return response.data;
};

export const getAllUsers = async (page = 1, size = 1000) => {
  const URL = `${endpoints.user.root}?page=${page}&size=${size}`;
  const response = await axios.get(URL);
  return response.data;
};

export const getUserById = async (id) => {
  const URL = `${endpoints.user.getById(id)}`;
  const response = await axios.get(URL);
  return response.data;
};

export const deleteUser = async (id) => {
  const URL = `${endpoints.user.deleteById(id)}`;
  const response = await axios.delete(URL);
  return response.data;
};

export const registerUser = async (data) => {
  const URL = `${endpoints.user.register}`;
  const response = await axios.post(URL, data);
  return response.data;
};

export const createUser = async (data) => {
  const URL = `${endpoints.user.root}`;
  const response = await axios.post(URL, data);
  return response.data;
};

export const getUserProfile = async () => {
  const URL = `${endpoints.user.profile}`;
  const response = await axios.get(URL);
  return response.data;
};

export const logoutUser = async () => {
  const URL = `${endpoints.user.logout}`;
  const response = await axios.post(URL);
  return response.data;
};
