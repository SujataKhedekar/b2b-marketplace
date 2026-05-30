import { Router } from 'express';
import { body } from 'express-validator';
import { createRFQ, listRFQs, getRFQ, closeRFQ } from '../controllers/rfqController.js';
import { submitBid } from '../controllers/bidController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();
router.use(protect);

router.route('/')
  .get(listRFQs)
  .post(
    authorize('buyer'),
    [
      body('productName').notEmpty(),
      body('quantity').isInt({ min: 1 }),
      body('budget').isFloat({ min: 0 }),
      body('deliveryLocation').notEmpty(),
      body('deliveryDeadline').isISO8601(),
    ],
    validate,
    createRFQ
  );

router.get('/:id', getRFQ);
router.patch('/:id/close', authorize('buyer'), closeRFQ);

// Seller submits a bid against an RFQ
router.post(
  '/:rfqId/bids',
  authorize('seller'),
  [body('pricePerUnit').isFloat({ min: 0 }), body('deliveryDays').isInt({ min: 0 })],
  validate,
  submitBid
);

export default router;
