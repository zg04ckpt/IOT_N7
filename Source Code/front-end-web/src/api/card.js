import axios from "../utils/axios";
import { endpoints } from "../constants/apiEndpoints";

export const getAllCards = async () => {
  const URL = endpoints.cards;
  const res = await axios.get(URL);
  return res;
};

export const createCard = async (data) => {
  const URL = endpoints.cards;
  const res = await axios.post(URL, {
    cardNumber: data.cardNumber,
    price: data.price,
    type: data.type,
  });
  return res;
};

export const updateCard = async (data, id) => {
  const URL = `${endpoints.cards}/${id}`;
  const res = await axios.put(URL, {
    cardNumber: data.cardNumber,
    price: data.price,
    type: data.type,
    isActive: data.isActive,
  });
  return res;
};

export const getCardById = async (id) => {
  const URL = `${endpoints.cards}/${id}`;
  const res = await axios.get(URL);
  return res;
};

export const deleteCard = async (id) => {
  const URL = `${endpoints.cards}/${id}`;
  const res = await axios.delete(URL);
  return res;
};

export const updatePriceAllCards = async (data) => {
  const URL = `${endpoints.cards}/update-all-price`;
  const res = await axios.post(URL, data);
  return res;
};

export const getAvailableCards = async () => {
  const URL = `${endpoints.cards}/available`;
  const res = await axios.get(URL);
  return res;
};
