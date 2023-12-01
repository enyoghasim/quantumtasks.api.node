import { Router } from 'express';
import PaymentController from '../controllers/payment.controller';

const router = Router();

const paymentController = new PaymentController();

router.post('/init', paymentController.initPayment);

export default router;
