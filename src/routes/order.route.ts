import express from 'express';
import { UserOrder } from '../controller/order.controller';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

router.post('/', verifyToken, UserOrder.createOrder);
router.get('/', verifyToken, UserOrder.getMyOrders);
router.get('/stats/weekly', verifyToken, UserOrder.getWeeklyTrend);

export const OrderRoutes = router;
