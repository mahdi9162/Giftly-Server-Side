import express from 'express';
import { ProductController } from '../controller/product.controller';
import { verifyToken } from '../middleware/auth';
import { allowRoles } from '../middleware/role';

const router = express.Router();

router.get('/', verifyToken, allowRoles('admin'), ProductController.getAdminProducts);
router.patch('/:id', verifyToken, allowRoles('admin'), ProductController.updateProduct);

export const AdminProductRoutes = router;
