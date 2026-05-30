import { Router } from 'express';
import { withdrawBid, myBids } from '../controllers/bidController.js';
import { acceptBid } from '../controllers/orderController.js';
import { startNegotiation } from '../controllers/negotiationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get('/mine', authorize('seller'), myBids);
router.delete('/:id', authorize('seller'), withdrawBid);
router.post('/:bidId/accept', authorize('buyer'), acceptBid);
router.post('/:bidId/negotiate', authorize('buyer'), startNegotiation);

export default router;
