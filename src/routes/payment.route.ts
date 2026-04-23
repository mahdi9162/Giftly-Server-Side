import express from 'express';
import { CreateStripeCheckoutSession } from '../controller/payment.controller';

const router = express.Router();

router.post('/create-checkout-session', CreateStripeCheckoutSession);

export const PaymentRoutes = router;
