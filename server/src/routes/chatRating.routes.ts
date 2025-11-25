import { Router } from 'express';
import { createRating, getRatingStatus } from '../controllers/chatRating.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/', createRating);
router.get('/status', getRatingStatus);

export default router;
