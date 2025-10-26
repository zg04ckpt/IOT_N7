import axios from "../utils/axios";
import { endpoints } from "../constants/apiEndpoints";

export const createMonthlyCard = async (data) => {
  const URL = `${endpoints.monthlyCards}/register`;
  const res = await axios.post(URL, data);
  return res;
};

export const getAllMonthlyUsers = async () => {
  const URL = endpoints.monthlyUsers;
  const res = await axios.get(URL);
  return res;
};

export const getMonthlyUserById = async (id) => {
  const URL = `${endpoints.monthlyUsers}/${id}`;
  const res = await axios.get(URL);
  return res;
};

export const updateMonthlyUser = async (data, id) => {
  const URL = `${endpoints.monthlyUsers}/${id}`;
  const res = await axios.put(URL, data);
  return res;
};

export const deleteMonthlyUser = async (id) => {
  const URL = `${endpoints.monthlyUsers}/${id}`;
  const res = await axios.delete(URL);
  return res;
};
