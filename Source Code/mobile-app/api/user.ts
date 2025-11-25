import axios from "@/utils/axios";
import { UserLogin, UserRegister } from "@/types/user";

export const loginUser = async (data: UserLogin) => {
  const response = await axios.post("/users/login", data);
  return response.data;
};

export const registerUser = async (data: UserRegister) => {
  const response = await axios.post("/users/register", data);
  return response.data;
};

export const getUserProfile = async () => {
  const response = await axios.get("/users/profile");
  return response.data;
};
