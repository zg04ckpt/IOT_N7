import express from "express";
import cardController from "../controllers/card.controller.js";
import manageCards from "../services/manageCards.js";

const router = express.Router();

router.get("/", manageCards.getAllCards);

router.get("/available", manageCards.getAvailableCards);

router.get("/:id", manageCards.getCardById);

router.get("/card/:cardNumber", manageCards.getCardByCardNumber);

router.post("/update-all-price", manageCards.updateAllCardPrices);

router.post("/", manageCards.createCard);

router.put("/:id", manageCards.updateCard);

router.delete("/:id", manageCards.deleteCard);

export default router;
