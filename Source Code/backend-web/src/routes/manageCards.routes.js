import express from "express";
import manageCardsService from "../services/manageCards.js";

const router = express.Router();

// ========== GET ==========
// Lấy tất cả thẻ
router.get("/", manageCardsService.getAllCards);

// Lấy thẻ theo ID
router.get("/:id", manageCardsService.getCardById);

// Tìm thẻ theo số thẻ
router.get("/search/:cardNumber", manageCardsService.searchCardByNumber);

// ========== POST (CREATE) ==========
// Thêm thẻ mới
router.post("/", manageCardsService.createCard);

// ========== PUT (UPDATE) ==========
// Cập nhật thẻ
router.put("/:id", manageCardsService.updateCard);

// Nạp tiền vào thẻ
router.patch("/:id/recharge", manageCardsService.rechargeCard);

// ========== DELETE ==========
// Xóa thẻ
router.delete("/:id", manageCardsService.deleteCard);

export default router;
