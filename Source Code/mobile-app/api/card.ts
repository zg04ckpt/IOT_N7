import axios from "@/utils/axios";

export interface Card {
  id: number;
  uid: string;
  type: "normal" | "monthly";
  monthly_user_name?: string | null;
  monthly_user_phone?: string | null;
  monthly_user_expiry?: string | null;
  monthly_user_address?: string | null;
  created_at: string;
  updated_at: string;
}

export const getCardById = async (id: number) => {
  const response = await axios.get(`/cards/${id}`);
  return response.data;
};

