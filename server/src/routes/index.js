import { Router } from 'express';
import authRoutes from './authRoutes.js';
import rfqRoutes from './rfqRoutes.js';
import bidRoutes from './bidRoutes.js';
import orderRoutes from './orderRoutes.js';
import negotiationRoutes from './negotiationRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import adminRoutes from './adminRoutes.js';
import sellerRoutes from './sellerRoutes.js';

const router = Router();

router.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }));
router.use('/auth', authRoutes);
router.use('/rfqs', rfqRoutes);
router.use('/bids', bidRoutes);
router.use('/orders', orderRoutes);
router.use('/negotiations', negotiationRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);
router.use('/sellers', sellerRoutes);

export default router;
