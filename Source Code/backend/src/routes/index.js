import express from 'express';
import userRouter from './user.route.js';

const router = express.Router();

router.use('/users', userRouter);

router.get('/health', (req, res) => {
  res.json({ status: 'API Running ...', timestamp: new Date().toISOString() });
});

export default router;