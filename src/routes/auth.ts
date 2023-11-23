import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import { userLoginValidationRules, userSignupValidationRules } from '../validators/authValidators';
import { requireAuth, guestOnly } from '../middlewares/auth';

const router = Router();

router.post('/signup', guestOnly, userSignupValidationRules, AuthController.signup);
router.post('/login', guestOnly, userLoginValidationRules, AuthController.login);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password/:selector/:token', AuthController.resetPassword);
router.get('/logout', requireAuth, AuthController.logout);

export default router;
