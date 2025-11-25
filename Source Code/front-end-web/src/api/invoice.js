import axios from "../utils/axios";
import { endpoints } from "../constants/apiEndpoints";

export const getAllInvoices = async (page, size) => {
  const URL = `${endpoints.invoice.root}?page=${page}&size=${size}`;
  const response = await axios.get(URL);
  return response.data;
};

export const getInvoiceStats = async (
  startDate,
  endDate,
  page = 1,
  size = 1000
) => {
  const URL = `${endpoints.invoice.stats}?startDate=${startDate}&endDate=${endDate}&page=${page}&size=${size}`;
  const response = await axios.get(URL);
  return response.data;
};

export const getInvoiceById = async (id) => {
  const URL = `${endpoints.invoice.getById(id)}`;
  const response = await axios.get(URL);
  return response.data;
};

export const getInvoiceBySessionId = async (sessionId) => {
  const URL = `${endpoints.invoice.getBySessionId(sessionId)}`;
  const response = await axios.get(URL);
  return response.data;
};
