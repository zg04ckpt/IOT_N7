import axios from "../utils/axios";
import { endpoints } from "../constants/apiEndpoints";

export const getAllCards = async (page = 1, size = 1000) => {
  const URL = `${endpoints.card.root}?page=${page}&size=${size}`;
  const response = await axios.get(URL);
  return response.data;
};

export const createCard = async (data) => {
  const URL = `${endpoints.card.root}`;
  const response = await axios.post(URL, data);
  return response.data;
};

export const registerMonthlyCard = async (id, data) => {
  const URL = `${endpoints.card.registerMonthlyCard(id)}`;
  const response = await axios.put(URL, data);
  return response.data;
};

export const unregisterMonthlyCard = async (id) => {
  const URL = `${endpoints.card.unregisterMonthlyCard(id)}`;
  const response = await axios.put(URL);
  return response.data;
};

export const getCardById = async (id) => {
  const URL = `${endpoints.card.getById(id)}`;
  const response = await axios.get(URL);
  return response.data;
};

export const deleteCard = async (id) => {
  const URL = `${endpoints.card.deleteById(id)}`;
  const response = await axios.delete(URL);
  return response.data;
};

export const getCardByUid = async (uid) => {
  const URL = `${endpoints.card.getByUid(uid)}`;
  const response = await axios.get(URL);
  return response.data;
};

export const updateCard = async (id, data) => {
  return true;
};

export const getAvailableCards = async () => {
  return true;
};
