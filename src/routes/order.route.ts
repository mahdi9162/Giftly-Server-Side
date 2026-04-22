import express from 'express';
import { createOrder, getAllOrders } from '../controller/order.controller';

const router = express.Router();

router.post('/', createOrder);
router.get('/', getAllOrders);

export const OrderRoutes = router;
