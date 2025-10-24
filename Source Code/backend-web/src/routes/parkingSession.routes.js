import express from "express";
import parkingSessionService from "../services/parkingSession.services.js";

const router = express.Router();

// GET all parking sessions
router.get("/", parkingSessionService.getAllParkingSessions);

// GET parking session by ID
router.get("/:id", parkingSessionService.getParkingSessionById);

// GET parking sessions by license plate
router.get("/license/:licensePlate", parkingSessionService.getParkingSessionsByLicensePlate);

// GET parking sessions by card ID
router.get("/card/:cardId", parkingSessionService.getParkingSessionsByCardId);

// POST create new parking session
router.post("/", parkingSessionService.createParkingSession);

// PUT update parking session
router.put("/:id", parkingSessionService.updateParkingSession);

// DELETE parking session
router.delete("/:id", parkingSessionService.deleteParkingSession);

export default router;
