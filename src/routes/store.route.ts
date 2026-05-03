import express from 'express';
import { verifyToken } from '../middleware/auth';
import { allowRoles } from '../middleware/role';
import { StoreController } from '../controller/store.controller';

const router = express.Router();

//get
router.get('/', StoreController.getStoreSettings);
//update
router.patch('/', verifyToken, allowRoles('admin', 'moderator'), StoreController.updateStoreSettings);

export const StoreRoutes = router;
