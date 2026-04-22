"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_routes_1 = require("./user.routes");
const product_routes_1 = require("./product.routes");
const products_admin_routes_1 = require("./products.admin.routes");
const ai_routes_1 = require("./ai.routes");
const order_route_1 = require("./order.route");
const router = express_1.default.Router();
const moduleRoutes = [
    {
        path: '/users',
        route: user_routes_1.UserRoutes,
    },
    {
        path: '/products',
        route: product_routes_1.ProductRoutes,
    },
    {
        path: '/admin/products',
        route: products_admin_routes_1.AdminProductRoutes,
    },
    {
        path: '/ai',
        route: ai_routes_1.AiRoutes,
    },
    {
        path: '/orders',
        route: order_route_1.OrderRoutes,
    },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));
exports.default = router;
