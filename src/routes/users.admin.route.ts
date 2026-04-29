import express from 'express';
import { AdminUserController } from '../controller/user.admin.controller';

const router = express.Router();

// get users
router.get('/', AdminUserController.adminGetUsers);

export const AdminUserRoutes = router;
