import express from 'express';
import userRouter from './user.route.js';
import cardRouter from './card.route.js';
import sessionRouter from './session.route.js';
import invoiceRouter from './invoice.route.js';
import deviceRouter from './device.route.js';
import enumRouter from './enum.route.js';

const router = express.Router();

router.use('/users', userRouter);
router.use('/cards', cardRouter);
router.use('/sessions', sessionRouter);
router.use('/invoices', invoiceRouter);
router.use('/devices', deviceRouter);
router.use('/enums', enumRouter);

router.get('/health', (req, res) => {
  res.json({ status: 'API Running ...', timestamp: new Date().toISOString() });
});

export default router;