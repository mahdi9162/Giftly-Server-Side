import express from 'express';
import { AdminDashboardController } from '../controller/dashboard.admin.controller';
import { verifyToken } from '../middleware/auth';
import { allowRoles } from '../middleware/role';

const router = express.Router();

// get dashboard overview
router.get('/', verifyToken, allowRoles('admin', 'moderator'), AdminDashboardController.getAdminOverview);

export const AdminDashboardRoutes = router;
