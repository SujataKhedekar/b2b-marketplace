import { Router } from 'express';
import { postMessage, getNegotiation } from '../controllers/negotiationController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get('/:id', getNegotiation);
router.post('/:id/messages', postMessage);

export default router;
