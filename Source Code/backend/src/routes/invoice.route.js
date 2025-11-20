import express from 'express';
import invoiceController from '../controllers/invoice.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import Role from '../models/role.model.js';

const invoiceRouter = express.Router();

// Tất cả route yêu cầu authentication
invoiceRouter.use(authMiddleware);

// ADMIN có thể xem tất cả và xóa
invoiceRouter.get('/', roleMiddleware([Role.ADMIN, Role.GUARD]), invoiceController.getAll);
invoiceRouter.get('/stats', roleMiddleware([Role.ADMIN, Role.GUARD]), invoiceController.getByDateRange);
invoiceRouter.get('/:id', roleMiddleware([Role.ADMIN, Role.GUARD]), invoiceController.getById);

export default invoiceRouter;
