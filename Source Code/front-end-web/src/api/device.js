import axios from "../utils/axios";
import { endpoints } from "../constants/apiEndpoints";

export const getAllDevices = async () => {
  const URL = endpoints.devices;
  const res = await axios.get(URL);
  return res;
};

export const createDevice = async (data) => {
  const URL = endpoints.devices;
  const res = await axios.post(URL, data);
  return res;
};

export const updateDevice = async (data, id) => {
  const URL = `${endpoints.devices}/${id}`;
  const res = await axios.put(URL, data);
  return res;
};

export const deleteDevice = async (id) => {
  const URL = `${endpoints.devices}/${id}`;
  const res = await axios.delete(URL);
  return res;
};
