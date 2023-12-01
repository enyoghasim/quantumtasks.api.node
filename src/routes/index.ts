import { Router } from 'express';
import Auth from './auth';
import User from './user';
import Order from './order';
import Payment from './payment';
import Webhooks from './webhooks';
import { requireAuth } from '../middlewares/auth';

const router = Router();

router.use('/auth', Auth);
router.use('/user', requireAuth, User);
router.use('/order', requireAuth, Order);
router.use('/payment', requireAuth, Payment);
router.use('/webhooks', Webhooks);

export default router;
