import { Router } from 'express';
import Auth from './auth';
import User from './user';
import Todo from './todo';
import { requireAuth } from '../middlewares/auth';

const router = Router();

router.use('/auth', Auth);
router.use('/user', requireAuth, User);
router.use('/todo', requireAuth, Todo);

export default router;
