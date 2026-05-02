import express from 'express';
import { AdminUserController } from '../controller/user.admin.controller';
import { verifyToken } from '../middleware/auth';
import { allowRoles } from '../middleware/role';

const router = express.Router();

// get users
router.get('/', verifyToken, allowRoles('admin', 'moderator'), AdminUserController.adminGetUsers);
// activate => deactivate => block --- Update API
router.patch('/:id/status', AdminUserController.adminUpdateUsers);

export const AdminUserRoutes = router;
