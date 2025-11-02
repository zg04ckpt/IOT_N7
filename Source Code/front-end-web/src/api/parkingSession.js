import axios from "../utils/axios";
import { endpoints } from "../constants/apiEndpoints";

export const getAllParkingSessions = async () => {
  const URL = endpoints.parkingSessions;
  const res = await axios.get(URL);
  return res;
};
