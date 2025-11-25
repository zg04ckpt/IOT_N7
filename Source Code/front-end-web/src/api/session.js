import axios from "../utils/axios";
import { endpoints } from "../constants/apiEndpoints";

export const checkInOut = async (data) => {
  const URL = `${endpoints.session.checkInOut}`;
  const response = await axios.post(URL, data);
  return response.data;
};

export const getAllSessions = async (page = 1, size = 10) => {
  const URL = `${endpoints.session.root}?page=${page}&size=${size}`;
  const response = await axios.get(URL);
  return response;
};
