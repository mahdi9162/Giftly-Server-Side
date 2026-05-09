import express from 'express';
import { UserOrder } from '../controller/order.controller';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

router.post('/', verifyToken, UserOrder.createOrder);
router.get('/overview', verifyToken, UserOrder.getOrdersOverview);
router.get('/stats/weekly', verifyToken, UserOrder.getWeeklyTrend);
router.get('/my-orders', verifyToken, UserOrder.getFullOrdersList);

export const OrderRoutes = router;
