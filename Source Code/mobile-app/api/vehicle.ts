import axios from "@/utils/axios";
import { ApiResponse } from "@/utils/ApiResponse";
import { VehicleInfo } from "@/types/vehicle";

export const getVehicleInfoByLicensePlate = async (
  licensePlate: string
): Promise<ApiResponse<VehicleInfo[]>> => {
  try {
    const response = await axios.post("/active-vehicles", {
      licensePlate,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching vehicle info:", error);
    throw error;
  }
};
