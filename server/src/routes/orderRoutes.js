import { Router } from 'express';
import { body } from 'express-validator';
import { listOrders, getOrder, updateOrderStatus } from '../controllers/orderController.js';
import { stripeCheckout, razorpayCheckout, confirmPayment } from '../controllers/paymentController.js';
import { createReview, getOrderReview } from '../controllers/reviewController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();
router.use(protect);

router.get('/', listOrders);
router.get('/:id', getOrder);
router.patch('/:id/status', updateOrderStatus);

// Payments
router.post('/:id/pay/stripe', stripeCheckout);
router.post('/:id/pay/razorpay', razorpayCheckout);
router.post('/:id/pay/confirm', confirmPayment);

// Reviews
router.get('/:orderId/review', getOrderReview);
router.post(
  '/:orderId/review',
  authorize('buyer'),
  [body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5')],
  validate,
  createReview
);

export default router;
