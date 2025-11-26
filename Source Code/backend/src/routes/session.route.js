import express from 'express';
import uploadMiddeware from '../middlewares/upload.middleware.js';
import sessionController from '../controllers/session.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import Role from '../models/role.model.js';

const sessionRouter = express.Router();

sessionRouter.use(authMiddleware);

sessionRouter.post('/check', 
    roleMiddleware([Role.GUARD]), 
    uploadMiddeware.single('image'), 
    sessionController.check);

sessionRouter.get('/', 
    roleMiddleware([Role.ADMIN]), 
    sessionController.getAll);


export default sessionRouter;