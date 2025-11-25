import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import Role from "../models/role.model.js";
import cardController from "../controllers/card.controller.js";

const cardRouter = express.Router();

cardRouter.use(authMiddleware);

cardRouter.get(
  "/info",
  roleMiddleware([Role.GUARD, Role.ADMIN]),
  cardController.getByUid
);

cardRouter.get("/:id", cardController.getById);

// Các route chỉ dành cho nhân viên bảo vệ và admin
cardRouter.use(roleMiddleware([Role.GUARD, Role.ADMIN]));
cardRouter.get("/", cardController.getAll);
cardRouter.post("/", cardController.createCard);
cardRouter.put("/:id/register-monthly", cardController.registerMonthlyCard);
cardRouter.put("/:id/unregister-monthly", cardController.unregisterMonthlyCard);
cardRouter.delete("/:id", cardController.deleteCard);

export default cardRouter;
