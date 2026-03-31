import express from 'express';
import { ProductController } from '../controller/product.controller';
import { validateProduct } from '../middleware/validateProduct';
import { verifyToken } from '../middleware/auth';
import { allowRoles } from '../middleware/role';

const router = express.Router();

// getAllProducts
router.get('/', ProductController.getAllProducts);
router.post('/', verifyToken, allowRoles('admin', 'moderator'), validateProduct, ProductController.createProduct);

export const ProductRoutes = router;
