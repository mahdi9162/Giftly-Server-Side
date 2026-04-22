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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllOrders = exports.createOrder = void 0;
const order_service_1 = require("../services/order.service");
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, order_service_1.createOrderIntoDB)(req.body);
        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: result,
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create order';
        res.status(400).json({
            success: false,
            message,
        });
    }
});
exports.createOrder = createOrder;
const getAllOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, order_service_1.getAllOrdersFromDB)();
        res.status(200).json({
            success: true,
            message: 'Orders retrieved successfully',
            data: result,
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to get orders';
        res.status(400).json({
            success: false,
            message,
        });
    }
});
exports.getAllOrders = getAllOrders;
