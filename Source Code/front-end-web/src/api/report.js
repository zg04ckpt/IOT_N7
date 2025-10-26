import axios from "../utils/axios";
import { endpoints } from "../constants/apiEndpoints";

export const getReports = async () => {
  const URL = endpoints.reports;
  const res = await axios.get(URL);
  return res;
};
