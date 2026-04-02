"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = require("mongoose");
const productSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    category: {
        type: String,
        required: true,
        enum: ['birthday', 'anniversary', 'for-him', 'for-her', 'family', 'personalized'],
    },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    reviews: { type: Number, required: true, min: 0, default: 0 },
    rating: { type: Number, required: true, min: 0, max: 5, default: 0 },
    badge: {
        type: String,
        enum: ['Best Seller', 'New'],
        required: false,
    },
    image: { type: String, required: true },
    alt: { type: String, required: true, trim: true },
    stock: { type: Number, required: true, min: 0 },
    status: { type: String, required: true, default: 'Draft' },
    featured: { type: Boolean, required: false, default: false },
    featuredOrder: { type: Number, required: false, min: 1 },
}, {
    timestamps: true,
});
exports.Product = (0, mongoose_1.model)('Product', productSchema);
