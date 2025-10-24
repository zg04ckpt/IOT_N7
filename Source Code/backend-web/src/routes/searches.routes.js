import express from "express";
import searchServices from "../services/search.services.js";

const router = express.Router();

router.get("/active-vehicles", searchServices.getListActiveVehicle);

export default router;
