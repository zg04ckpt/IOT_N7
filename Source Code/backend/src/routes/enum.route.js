import express from 'express';
import enumController from '../controllers/enum.controller.js';

const enumRouter = express.Router();

// Public routes - không cần authentication
enumRouter.get('/', enumController.getAllEnums);
enumRouter.get('/roles', enumController.getRoles);
enumRouter.get('/card-types', enumController.getCardTypes);
enumRouter.get('/session-statuses', enumController.getSessionStatuses);
enumRouter.get('/invoice-sources', enumController.getInvoiceSources);
enumRouter.get('/pricing-config', enumController.getPricingConfig);
enumRouter.get('/board-types', enumController.getBoardTypes);
enumRouter.get('/device-statuses', enumController.getDeviceStatuses);

export default enumRouter;
