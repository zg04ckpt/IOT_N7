import express from "express";
import checkOutService from "../services/checkOut.services.js";

const router = express.Router();

router.post("/:id", checkOutService.checkOutParkingSession);

export default router;
