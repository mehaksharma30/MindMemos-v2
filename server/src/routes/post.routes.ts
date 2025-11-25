import { Router } from 'express';
import {
  getPosts,
  getMyPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
} from '../controllers/post.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getPosts);

router.use(authMiddleware);

router.get('/mine', getMyPosts);
router.get('/:id', getPostById);
router.post('/', createPost);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);
router.post('/:id/like', likePost);
router.post('/:id/unlike', unlikePost);

export default router;
