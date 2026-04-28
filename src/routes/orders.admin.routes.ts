import express from 'express';
import { AdminOrderController } from '../controller/order.admin.controller';
import { verifyToken } from '../middleware/auth';
import { allowRoles } from '../middleware/role';

const router = express.Router();

// order get api
router.get('/', verifyToken, allowRoles('admin', 'moderator'), AdminOrderController.getAdminOrders);
// update delivery status
router.patch('/:id', AdminOrderController.updateOrderAndPaymentStatus);

export const AdminOrderRoutes = router;
