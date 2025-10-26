import express from "express";
import checkInService from "../services/checkIn.services.js";
import { upload } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.post(
  "/",
  upload.single("imageUrl"),
  checkInService.createParkingSession
);

export default router;
