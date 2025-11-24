import axios from "../utils/axios";
import { endpoints } from "../constants/apiEndpoints";

export const getAllEnums = async () => {
  const URL = `${endpoints.enum.root}`;
  const response = await axios.get(URL);
  return response.data;
};

export const getRoles = async () => {
  const URL = `${endpoints.enum.roles}`;
  const response = await axios.get(URL);
  return response.data;
};
