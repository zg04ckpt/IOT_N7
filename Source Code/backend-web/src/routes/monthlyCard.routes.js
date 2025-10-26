import express from "express";
import addMonthCardService from "../services/addMonthCard.js";

const router = express.Router();

router.post("/register", addMonthCardService.registerMonthlyCard);

router.get("/users", addMonthCardService.getMonthlyCardUsers);

router.get("/users/:userId", addMonthCardService.getMonthlyCardUserById);

router.put("/users/:userId", addMonthCardService.updateMonthlyCardUser);

router.delete("/users/:userId", addMonthCardService.cancelMonthlyCard);

export default router;
