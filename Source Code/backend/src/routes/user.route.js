import express from 'express';
import userController from '../controllers/user.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import Role from '../models/role.model.js';

const userRouter = express.Router();

// Anyone
userRouter.post('/register', userController.register);
userRouter.post('/login', userController.login);
userRouter.post('/logout', userController.logout);

// Authenticated users
userRouter.get('/profile', authMiddleware, userController.getProfile);


// Quản lý, admin
userRouter.use(authMiddleware);
userRouter.use(roleMiddleware([Role.ADMIN]));
userRouter.get('/', userController.getAll);
userRouter.post('/', userController.create);
userRouter.get('/:id', userController.getById);
userRouter.delete('/:id', userController.delete);


export default userRouter;