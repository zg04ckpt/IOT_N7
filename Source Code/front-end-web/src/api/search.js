import axios from "../utils/axios";
import { endpoints } from "../constants/apiEndpoints";

export const getVehicleInfoByLicensePlate = async (data) => {
  const URL = "active-vehicles";
  const res = await axios.post(URL, data);
  return res;
};
