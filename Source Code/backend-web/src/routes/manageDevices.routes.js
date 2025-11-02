import express from "express";
import manageDevicesService from "../services/manageDevices.js";

const router = express.Router();

router.get("/", manageDevicesService.getAllDevices);

router.get("/:id", manageDevicesService.getDeviceById);

router.get("/location/:location", manageDevicesService.getDevicesByLocation);

router.post("/", manageDevicesService.createDevice);

router.put("/:id", manageDevicesService.updateDevice);

router.patch("/:id/status", manageDevicesService.updateDeviceStatus);

router.delete("/:id", manageDevicesService.deleteDevice);

export default router;
