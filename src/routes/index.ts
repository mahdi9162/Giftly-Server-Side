import express from 'express';
import { UserRoutes } from './user.routes';
import { ProductRoutes } from './product.routes';
import { AdminProductRoutes } from './products.admin.routes';
import { AiRoutes } from './ai.routes';
import { OrderRoutes } from './order.route';
import { PaymentRoutes } from './payment.route';
import { AdminOrderRoutes } from './orders.admin.routes';
import { AdminUserRoutes } from './users.admin.route';
import { StoreRoutes } from './store.route';
import { AdminDashboardRoutes } from './dashboard.admin.route';
import { NewsletterRoutes } from './newsletter.routes';

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
  {
    path: '/admin/orders',
    route: AdminOrderRoutes,
  },
  {
    path: '/admin/users',
    route: AdminUserRoutes,
  },
  {
    path: '/store',
    route: StoreRoutes,
  },
  {
    path: '/admin/dashboard',
    route: AdminDashboardRoutes,
  },
  {
    path: '/newsletter',
    route: NewsletterRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
