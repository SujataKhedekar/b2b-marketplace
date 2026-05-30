import { Router } from 'express';
import { listUsers, updateUser, analytics } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();
router.use(protect, authorize('admin'));

router.get('/users', listUsers);
router.patch('/users/:id', updateUser);
router.get('/analytics', analytics);

export default router;
