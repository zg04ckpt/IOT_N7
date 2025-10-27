import express from "express";
import checkOutService from "../services/checkOut.services.js";

const router = express.Router();

router.post("/", checkOutService.checkOutParkingSession);

export default router;
