import express from "express";
import addMonthCardService from "../services/addMonthCard.js";

const router = express.Router();

/**
 * ROUTES ĐÃ KÝ VÉ THÁNG
 * Endpoint: /api/monthly-cards
 */

// ========== POST (CREATE) ==========
/**
 * Đăng kí vé tháng mới
 * POST /api/monthly-cards/register
 * Body: { name, phoneNumber, cardId, licensePlate }
 * 
 * Quy trình:
 * 1. Tạo UserInfo mới với name, phoneNumber, licensePlate, cardId
 * 2. Cập nhật Card với type = 1 (vé tháng)
 * 3. Trả về thông tin thành công
 */
router.post("/register", addMonthCardService.registerMonthlyCard);

// ========== GET ==========
/**
 * Lấy danh sách tất cả người gửi xe vé tháng
 * GET /api/monthly-cards/users
 */
router.get("/users", addMonthCardService.getMonthlyCardUsers);

/**
 * Lấy thông tin vé tháng theo User ID
 * GET /api/monthly-cards/users/:userId
 */
router.get("/users/:userId", addMonthCardService.getMonthlyCardUserById);

// ========== PUT (UPDATE) ==========
/**
 * Cập nhật thông tin vé tháng
 * PUT /api/monthly-cards/users/:userId
 * Body: { name, phoneNumber, licensePlate }
 */
router.put("/users/:userId", addMonthCardService.updateMonthlyCardUser);

// ========== DELETE ==========
/**
 * Hủy vé tháng
 * DELETE /api/monthly-cards/users/:userId
 */
router.delete("/users/:userId", addMonthCardService.cancelMonthlyCard);

export default router;
