import { MonthlyTicketInfo } from "./monthly-ticket";

export interface VehicleInfo {
  id: number;
  licensePlate: string;
  cardId: number;
  timeStart: string;
  timeElapsed: number;
  timeElapsedMinutes: number;
  timeElapsedSeconds: number;
  imageUrl: string;
  cardType: number;
  amount: number;
  amountToPay: number;
  status: string;
  monthlyTicketInfo?: MonthlyTicketInfo;
}
