import { Router } from 'express';
import PaymentController from '../../controllers/payment.controller';

const router = Router();

const paymentController = new PaymentController();

router.post('/', paymentController.handlePaystackWebhook);

export default router;
