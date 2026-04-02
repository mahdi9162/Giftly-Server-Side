"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRoutes = void 0;
const express_1 = __importDefault(require("express"));
const product_controller_1 = require("../controller/product.controller");
const validateProduct_1 = require("../middleware/validateProduct");
const auth_1 = require("../middleware/auth");
const role_1 = require("../middleware/role");
const router = express_1.default.Router();
// getAllProducts
router.get('/', product_controller_1.ProductController.getAllProducts);
router.get('/:id', product_controller_1.ProductController.getProductDetails);
router.post('/', auth_1.verifyToken, (0, role_1.allowRoles)('admin', 'moderator'), validateProduct_1.validateProduct, product_controller_1.ProductController.createProduct);
exports.ProductRoutes = router;
