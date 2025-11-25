import { Router } from 'express';
import {
  getCommentsByPost,
  createComment,
  deleteComment,
} from '../controllers/comment.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/post/:postId', getCommentsByPost);
router.post('/post/:postId', createComment);
router.delete('/:commentId', deleteComment);

export default router;
