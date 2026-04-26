import express from 'express';
import { ProductController } from '../controller/product.controller';

const router = express.Router();

// getAllProducts
router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getProductDetails);

export const ProductRoutes = router;
