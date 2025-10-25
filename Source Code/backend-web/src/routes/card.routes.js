import express from "express";
import cardController from "../controllers/card.controller.js";
import manageCards from "../services/manageCards.js";

const router = express.Router();

// GET all cards
// router.get("/", cardController.getAllCards);
router.get("/", manageCards.getAllCards);

// GET card by ID
router.get("/:id", manageCards.getCardById);

// GET card by card number
router.get("/card/:cardNumber", manageCards.getCardByCardNumber);

router.post("/update-all-price", manageCards.updateAllCardPrices);

// POST create new card
router.post("/", manageCards.createCard);

// PUT update card
router.put("/:id", manageCards.updateCard);

// DELETE card
router.delete("/:id", manageCards.deleteCard);

export default router;
