import express from "express";
import adminController from "../controllers/admin.controller.js";

const router = express.Router();

// GET all admins
router.get("/", adminController.getAllAdmins);

// GET admin by ID
router.get("/:id", adminController.getAdminById);

// GET admin by email
router.get("/email/:email", adminController.getAdminByEmail);

// POST create new admin
router.post("/", adminController.createAdmin);

// PUT update admin
router.put("/:id", adminController.updateAdmin);

// DELETE admin
router.delete("/:id", adminController.deleteAdmin);

export default router;
