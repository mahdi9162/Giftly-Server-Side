import express from 'express';
import { AdminDashboardController } from '../controller/dashboard.admin.controller';
import { verifyToken } from '../middleware/auth';
import { allowRoles } from '../middleware/role';

const router = express.Router();

// get dashboard overview
router.get('/stats', verifyToken, allowRoles('admin', 'moderator'), AdminDashboardController.getAdminOverview);
// get sales overview
router.get('/sales-overview', verifyToken, allowRoles('admin', 'moderator'), AdminDashboardController.getSalesOverview);
// top products
router.get('/top-products', AdminDashboardController.getTopProducts);

export const AdminDashboardRoutes = router;
