import express from "express";
import manageDevicesService from "../services/manageDevices.js";

const router = express.Router();

// ========== GET ==========
// Lấy tất cả thiết bị
router.get("/", manageDevicesService.getAllDevices);

// Lấy thiết bị theo ID
router.get("/:id", manageDevicesService.getDeviceById);

// Lấy thiết bị theo vị trí
router.get("/location/:location", manageDevicesService.getDevicesByLocation);

// ========== POST (CREATE) ==========
// Thêm thiết bị mới
router.post("/", manageDevicesService.createDevice);

// ========== PUT (UPDATE) ==========
// Cập nhật thiết bị
router.put("/:id", manageDevicesService.updateDevice);

// Cập nhật trạng thái thiết bị
router.patch("/:id/status", manageDevicesService.updateDeviceStatus);

// ========== DELETE ==========
// Xóa thiết bị
router.delete("/:id", manageDevicesService.deleteDevice);

export default router;
