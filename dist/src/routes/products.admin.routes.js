"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminProductRoutes = void 0;
const express_1 = __importDefault(require("express"));
const product_controller_1 = require("../controller/product.controller");
const auth_1 = require("../middleware/auth");
const role_1 = require("../middleware/role");
const router = express_1.default.Router();
router.get('/', auth_1.verifyToken, (0, role_1.allowRoles)('admin'), product_controller_1.ProductController.getAdminProducts);
router.patch('/:id', auth_1.verifyToken, (0, role_1.allowRoles)('admin'), product_controller_1.ProductController.updateProduct);
exports.AdminProductRoutes = router;
