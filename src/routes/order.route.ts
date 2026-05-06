import express from 'express';
import { UserOrder } from '../controller/order.controller';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

router.post('/', verifyToken, UserOrder.createOrder);
router.get('/', verifyToken, UserOrder.getMyOrders);

export const OrderRoutes = router;
