import express from 'express';
import checkInService from "../services/checkIn.services.js";

const router = express.Router();
router.post('/check-in', checkInService.createParkingSession);
export default router;