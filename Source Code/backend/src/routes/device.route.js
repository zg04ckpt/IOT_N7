import express from 'express';
import deviceController from '../controllers/device.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import Role from '../models/role.model.js';

const deviceRouter = express.Router();

// Public API cho device (không cần auth)
deviceRouter.get('/check-version', deviceController.checkVersion);
deviceRouter.post('/update-status', deviceController.updateStatus);

// Admin API (cần auth + ADMIN role)
// deviceRouter.use(authMiddleware);
// deviceRouter.use(roleMiddleware([Role.ADMIN]));

deviceRouter.get('/', deviceController.getAll);
deviceRouter.get('/:id', deviceController.getById);
deviceRouter.post('/', deviceController.create);
deviceRouter.post('/:id/versions', deviceController.updateVersion);
deviceRouter.delete('/:id', deviceController.delete);

export default deviceRouter;
