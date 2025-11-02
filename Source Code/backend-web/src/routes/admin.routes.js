import express from "express";
import adminController from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/", adminController.getAllAdmins);

router.get("/:id", adminController.getAdminById);

router.get("/email/:email", adminController.getAdminByEmail);

router.post("/", adminController.createAdmin);

router.put("/:id", adminController.updateAdmin);

router.delete("/:id", adminController.deleteAdmin);

export default router;
