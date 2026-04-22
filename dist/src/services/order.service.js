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
exports.getAllOrdersFromDB = exports.createOrderIntoDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const product_model_1 = require("../model/product/product.model");
const order_model_1 = require("../model/order/order.model");
// create
const createOrderIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { customerInfo, shippingAddress, deliveryMethod, paymentMethod, items } = payload;
    if (!items || items.length === 0) {
        throw new Error('Order items are required');
    }
    let subtotal = 0;
    const validatedItems = [];
    for (const item of items) {
        if (!mongoose_1.default.Types.ObjectId.isValid(item.productId)) {
            throw new Error(`Invalid product id: ${item.productId}`);
        }
        const product = yield product_model_1.Product.findById(item.productId);
        if (!product) {
            throw new Error(`Product not found: ${item.productId}`);
        }
        if (product.stock < item.quantity) {
            throw new Error(`Not enough stock for product: ${product.name}`);
        }
        product.stock = product.stock - item.quantity;
        yield product.save();
        subtotal += product.price * item.quantity;
        validatedItems.push({
            productId: product._id,
            quantity: item.quantity,
        });
    }
    const shippingCost = deliveryMethod === 'express' ? 8 : 0;
    const total = subtotal + shippingCost;
    const order = yield order_model_1.Order.create({
        customerInfo,
        shippingAddress,
        deliveryMethod,
        paymentMethod,
        items: validatedItems,
        subtotal,
        shippingCost,
        total,
        paymentStatus: 'pending',
        orderStatus: 'pending',
    });
    return order;
});
exports.createOrderIntoDB = createOrderIntoDB;
// get
const getAllOrdersFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const orders = yield order_model_1.Order.find().sort({ createdAt: -1 });
    return orders;
});
exports.getAllOrdersFromDB = getAllOrdersFromDB;
