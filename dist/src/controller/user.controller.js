"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userControllers = void 0;
const user_model_1 = require("../model/user/user.model");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// register user
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        // Check if user already exists
        const isUserExist = yield user_model_1.User.findOne({ email });
        if (isUserExist) {
            return res.status(400).json({
                success: false,
                message: 'User already exists',
            });
        }
        const savedUser = yield user_model_1.User.create({
            name,
            email,
            password,
        });
        // Generate token
        const token = jsonwebtoken_1.default.sign({ userId: savedUser._id, email: savedUser.email, role: savedUser.role }, config_1.default.jwt_secret, {
            expiresIn: config_1.default.jwt_expires_in,
        });
        // Omit password from response
        const userResponse = savedUser.toObject();
        delete userResponse.password;
        // set httpOnly cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
        });
        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: userResponse,
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to register user',
            error: err.message,
        });
    }
});
// Login user
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Check if user exists
        const user = yield user_model_1.User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }
        // Compare passwords
        const isPasswordMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }
        // Generate token
        const token = jsonwebtoken_1.default.sign({ userId: user._id, email: user.email, role: user.role }, config_1.default.jwt_secret, {
            expiresIn: config_1.default.jwt_expires_in,
        });
        // Omit password from response
        const userResponse = user.toObject();
        delete userResponse.password;
        // set httpOnly cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
        });
        return res.status(200).json({
            success: true,
            message: 'User logged in successfully',
            data: userResponse,
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Failed to login user',
            error: err.message,
        });
    }
});
// Logout user
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
        });
        return res.status(200).json({
            success: true,
            message: 'User logged out successfully',
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Failed to logout user',
            error: err.message,
        });
    }
});
// Me
const getMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized access',
            });
        }
        const user = yield user_model_1.User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }
        return res.status(200).json({
            success: true,
            message: 'User fetched successfully',
            data: user,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to get user',
            error: error.message,
        });
    }
});
exports.userControllers = {
    register,
    login,
    logout,
    getMe,
};
