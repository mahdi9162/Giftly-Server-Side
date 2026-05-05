import express from 'express';
import { verifyToken } from '../middleware/auth';
import { allowRoles } from '../middleware/role';
import { AdminProductController } from '../controller/product.admin.controller';
import { validateProduct } from '../middleware/validateProduct';

const router = express.Router();
// create product
router.post('/', verifyToken, allowRoles('admin', 'moderator'), validateProduct, AdminProductController.createProduct);
// get product
router.get('/', verifyToken, allowRoles('admin', 'moderator'), AdminProductController.getAdminProducts);

// get low stock products
router.get('/low-stock', verifyToken, allowRoles('admin', 'moderator'), AdminProductController.getLowStockProducts);

// get single product
router.get('/:id', verifyToken, allowRoles('admin', 'moderator'), AdminProductController.getAdminProductById);

// update product
router.patch('/:id', verifyToken, allowRoles('admin', 'moderator'), AdminProductController.updateProduct);

// delete product
router.delete('/:id', verifyToken, allowRoles('admin', 'moderator'), AdminProductController.deleteProduct);

export const AdminProductRoutes = router;
