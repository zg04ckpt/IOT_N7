import express from "express";
import authService from "../services/auth.services.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/login", authService.loginAdmin);

router.post("/logout", protect, authService.logoutAdmin);

router.get("/me", protect, authService.getCurrentUser);

export default router;
