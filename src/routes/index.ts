import express from 'express';
import { UserRoutes } from './user.routes';
import { ProductRoutes } from './product.routes';
import { AdminProductRoutes } from './products.admin.routes';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/products',
    route: ProductRoutes,
  },
  {
    path: '/admin/products',
    route: AdminProductRoutes
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
