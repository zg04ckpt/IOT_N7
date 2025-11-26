import axios from "../utils/axios";
import { endpoints } from "../constants/apiEndpoints";

export const getAllDevices = async (page = 1, size = 1000) => {
  const URL = `${endpoints.device.root}?page=${page}&size=${size}`;
  const response = await axios.get(URL);
  return response;
};

export const createDevice = async (data) => {
  const URL = endpoints.device.root;
  const response = await axios.post(URL, data);
  return response;
};

export const getDeviceById = async (id) => {
  const URL = endpoints.device.getById(id);
  const response = await axios.get(URL);
  return response;
};

export const updateVersion = async (id, data) => {
  const URL = endpoints.device.updateVersion(id);
  const response = await axios.post(URL, data);
  return response;
};

export const deleteDevice = async (id) => {
  const URL = endpoints.device.deleteById(id);
  const response = await axios.delete(URL);
  return response;
};
