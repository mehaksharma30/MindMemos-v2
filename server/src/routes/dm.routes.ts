import { Router } from 'express';
import {
  getConversations,
  getOrCreateConversation,
  getMessages,
  createMessage,
} from '../controllers/dm.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/conversations', getConversations);
router.get('/conversations/with/:userId', getOrCreateConversation);
router.get('/messages/:conversationId', getMessages);
router.post('/messages', createMessage);

export default router;
