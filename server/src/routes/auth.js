import { Router } from 'express';
import { login, getMe, forgotPassword, verifyResetCode, resetPassword } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);
router.get('/me', authenticate, getMe);

export default router;
