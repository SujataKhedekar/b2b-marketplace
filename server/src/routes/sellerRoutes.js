import { Router } from 'express';
import { listSellerReviews } from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get('/:sellerId/reviews', listSellerReviews);

export default router;
