import express from 'express';
import { UserRoutes } from './user.routes';
import { ProductRoutes } from './product.routes';
import { AdminProductRoutes } from './products.admin.routes';
import { AiRoutes } from './ai.routes';
import { OrderRoutes } from './order.route';
import { PaymentRoutes } from './payment.route';

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
    route: AdminProductRoutes,
  },
  {
    path: '/ai',
    route: AiRoutes,
  },
  {
    path: '/orders',
    route: OrderRoutes,
  },
  {
    path: '/payments',
    route: PaymentRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
