import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import Role from '../models/role.model.js';
import cardController from '../controllers/card.controller.js';

const cardRouter = express.Router();

// Chỉ dành cho nhân viên bảo vệ
cardRouter.use(authMiddleware);
cardRouter.use(roleMiddleware([Role.GUARD]))
cardRouter.get('/', cardController.getAll);
cardRouter.get('/info', cardController.getByUid);
cardRouter.get('/:id', cardController.getById);
cardRouter.post('/', cardController.createCard);
cardRouter.put('/:id/register-monthly', cardController.registerMonthlyCard)
cardRouter.put('/:id/unregister-monthly', cardController.unregisterMonthlyCard)
cardRouter.delete('/:id', cardController.deleteCard)

export default cardRouter;
