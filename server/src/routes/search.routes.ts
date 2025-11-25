import { Router } from 'express';
import { searchUsersByTopic } from '../controllers/search.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/users-by-topic', searchUsersByTopic);

export default router;
