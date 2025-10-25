import express from "express";
import deviceController from "../controllers/device.controller.js";

const router = express.Router();

// GET all devices
router.get("/", deviceController.getAllDevices);

// GET device by ID
router.get("/:id", deviceController.getDeviceById);

// GET devices by location
// router.get("/location/:location", deviceController.getDevicesByLocation);

// POST create new device
router.post("/", deviceController.createDevice);

// PUT update device
router.put("/:id", deviceController.updateDevice);

// DELETE device
router.delete("/:id", deviceController.deleteDevice);

export default router;
