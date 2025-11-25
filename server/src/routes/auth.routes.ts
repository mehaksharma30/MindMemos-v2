import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
  registerValidation,
  loginValidation,
} from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/logout', logout);
router.get('/me', authMiddleware, getMe);

export default router;
