"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controller/user.controller");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Register user
router.post('/register', user_controller_1.userControllers.register);
// Login user
router.post('/login', user_controller_1.userControllers.login);
// Logout user
router.post('/logout', user_controller_1.userControllers.logout);
// Me
router.get('/me', auth_1.verifyToken, user_controller_1.userControllers.getMe);
exports.UserRoutes = router;
