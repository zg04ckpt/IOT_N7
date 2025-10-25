import express from "express";
import authService from "../services/auth.services.js";
import verifyToken from "../middlewares/authJWT.js";

const router = express.Router();

/**
 * LOGIN
 * POST /api/auth/login
 * Body: { username, password }
 */
router.post("/login", authService.loginAdmin);

/**
 * LOGOUT
 * POST /api/auth/logout
 * Header: Authorization: Bearer <token>
 */
router.post("/logout", verifyToken, authService.logoutAdmin);

export default router;
