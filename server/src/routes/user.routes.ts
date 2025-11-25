import { Router } from 'express';
import { getUserProfile, getUserPosts } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/:userId', getUserProfile);
router.get('/:userId/posts', getUserPosts);

export default router;
