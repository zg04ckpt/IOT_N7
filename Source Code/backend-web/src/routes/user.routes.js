import express from 'express';
import userController from '../services/user.services.js';

const router = express.Router();

router.get('/test', userController.test);

export default router;