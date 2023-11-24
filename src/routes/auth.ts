import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import { requireAuth, guestOnly } from '../middlewares/auth';

const router = Router();

router.post('/login', guestOnly, AuthController.login);
router.post('/signup', guestOnly, AuthController.signup);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password/:selector/:token', AuthController.resetPassword);
router.get('/logout', requireAuth, AuthController.logout);

export default router;
