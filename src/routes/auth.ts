import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import { userLoginValidationRules, userSignupValidationRules } from '../validators/authValidators';
import requireAuth from '../middlewares/auth';

const router = Router();

router.post('/signup', userSignupValidationRules, AuthController.signup);
router.post('/login', userLoginValidationRules, AuthController.login);
router.get('/logout', requireAuth, AuthController.logout);

export default router;
