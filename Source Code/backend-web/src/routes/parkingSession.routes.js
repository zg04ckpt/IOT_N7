import express from "express";
import parkingSessionService from "../services/parkingSession.services.js";

const router = express.Router();

router.get("/", parkingSessionService.getAllParkingSessions);

router.get("/:id", parkingSessionService.getParkingSessionById);

router.get(
  "/license/:licensePlate",
  parkingSessionService.getParkingSessionsByLicensePlate
);

router.get("/card/:cardId", parkingSessionService.getParkingSessionsByCardId);

router.post("/", parkingSessionService.createParkingSession);

router.put("/:id", parkingSessionService.updateParkingSession);

router.delete("/:id", parkingSessionService.deleteParkingSession);

export default router;
