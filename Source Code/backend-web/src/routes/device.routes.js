import express from "express";
import deviceController from "../controllers/device.controller.js";

const router = express.Router();

router.get("/", deviceController.getAllDevices);

router.get("/:id", deviceController.getDeviceById);

router.post("/", deviceController.createDevice);

router.put("/:id", deviceController.updateDevice);

router.delete("/:id", deviceController.deleteDevice);

export default router;
