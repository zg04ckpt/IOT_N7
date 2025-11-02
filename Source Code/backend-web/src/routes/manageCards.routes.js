import express from "express";
import manageCardsService from "../services/manageCards.js";

const router = express.Router();

router.get("/", manageCardsService.getAllCards);

router.get("/:id", manageCardsService.getCardById);

router.get("/search/:cardNumber", manageCardsService.searchCardByNumber);

router.post("/", manageCardsService.createCard);

router.put("/:id", manageCardsService.updateCard);

router.patch("/:id/recharge", manageCardsService.rechargeCard);

router.delete("/:id", manageCardsService.deleteCard);

export default router;
