import express from "express";
import searchServices from "../services/search.services.js";

const router = express.Router();

router.post("/active-vehicles", searchServices.getListActiveVehicle);

router.post("/vehicle-history-checkin", searchServices.getVehicleHistory);

router.post("/vehicle-history-checkout", searchServices.getCardHistory);

router.post("/vehicle-history-checkin/licensePlate", searchServices.getVehicleHistoryByLicensePlate);

router.post("/vehicle-history-checkout/licensePlate", searchServices.getCardHistoryByCardId);


export default router;
