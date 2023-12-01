import { Router } from 'express';
import Paystack from './paystack';

const router = Router();

router.use('/paystack', Paystack);

export default router;
