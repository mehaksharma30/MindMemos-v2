import { Router } from 'express';
import { aiChat } from '../controllers/ai.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/chat', aiChat);

export default router;
