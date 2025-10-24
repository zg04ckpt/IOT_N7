import express from "express";
import cardController from "../controllers/card.controller.js";

const router = express.Router();

// GET all cards
router.get("/", cardController.getAllCards);

// GET card by ID
router.get("/:id", cardController.getCardById);

// GET card by card number
router.get("/number/:cardNumber", cardController.getCardByCardNumber);

// POST create new card
router.post("/", cardController.createCard);

// PUT update card
router.put("/:id", cardController.updateCard);

// DELETE card
router.delete("/:id", cardController.deleteCard);

export default router;
