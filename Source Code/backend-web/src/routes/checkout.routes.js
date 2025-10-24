import express from 'express';
import checkOutService from "../services/checkOut.services.js";

const router = express.Router();

// POST checkout - cập nhật timeEnd = hiện tại, giữ nguyên các thông tin khác
// URL: POST /api/checkout/:id
router.post('/:id', checkOutService.checkOutParkingSession);

export default router;
