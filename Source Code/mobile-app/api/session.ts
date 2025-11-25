import axios from "@/utils/axios";

export interface ParkingSession {
  id: number;
  card_id: number;
  plate: string;
  status: "packing" | "end";
  check_in: string;
  check_out?: string;
  check_in_image_url?: string;
  check_out_image_url?: string;
  total_amount?: number;
  invoice_id?: number;
}

export const getInvoiceBySessionId = async (sessionId: number) => {
  const response = await axios.get(`/invoices/session/${sessionId}`);
  return response.data;
};
