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
exports.getGiftRecommendations = void 0;
const parseBudget_1 = require("../lib/parseBudget");
const product_model_1 = require("../model/product/product.model");
const ai_service_1 = require("../services/ai.service");
const callGroq_1 = require("../lib/callGroq");
const buildAiPromt_1 = __importDefault(require("../utils/buildAiPromt"));
const getGiftRecommendations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        const { person, occasion, budget, interests } = body;
        console.log('AI Request Body:', body);
        const { minPrice, maxPrice } = (0, parseBudget_1.parseBudgetRange)(budget);
        console.log('Parsed Budget:', { minPrice, maxPrice });
        const preferredCategories = (0, ai_service_1.getPreferredCategories)(occasion, person);
        console.log('Preferred Categories:', preferredCategories);
        let candidateProducts = yield product_model_1.Product.find({
            status: 'Active',
            stock: { $gt: 0 },
            price: { $gte: minPrice, $lte: maxPrice },
            category: { $in: preferredCategories },
        });
        if (candidateProducts.length === 0) {
            console.log('Fallback: broad search');
            candidateProducts = yield product_model_1.Product.find({
                status: 'Active',
                stock: { $gt: 0 },
                price: { $gte: minPrice, $lte: maxPrice },
            }).limit(10);
        }
        const aiProductContext = candidateProducts.map((product) => ({
            _id: product._id.toString(),
            name: product.name,
            category: product.category,
            description: product.description,
            price: product.price,
            rating: product.rating,
            reviews: product.reviews,
        }));
        if (aiProductContext.length === 0) {
            return res.status(200).json({
                success: false,
                explanation: 'No suitable products were found for this combination of budget, occasion, and person.',
                products: [],
                message: 'Try a different budget or broader gift preferences.',
            });
        }
        const prompt = (0, buildAiPromt_1.default)({
            person,
            occasion,
            budget,
            interests,
            aiProductContext,
        });
        const rawAiResponse = yield (0, callGroq_1.callGroq)(prompt);
        console.log('Raw AI Response:', rawAiResponse);
        const cleanedAiResponse = rawAiResponse
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();
        console.log('Cleaned AI Response:', cleanedAiResponse);
        let parsedAiResponse;
        try {
            parsedAiResponse = JSON.parse(cleanedAiResponse);
        }
        catch (error) {
            console.error('Failed to parse AI response:', cleanedAiResponse);
            return res.status(500).json({
                success: false,
                message: 'AI returned invalid JSON format',
                raw: cleanedAiResponse,
            });
        }
        if (!parsedAiResponse.products || !Array.isArray(parsedAiResponse.products)) {
            return res.status(500).json({
                success: false,
                message: 'AI response does not contain a valid products array',
                raw: parsedAiResponse,
            });
        }
        const finalProducts = parsedAiResponse.products
            .map((aiItem) => {
            const matchedProduct = candidateProducts.find((product) => product._id.toString() === aiItem._id);
            if (!matchedProduct)
                return null;
            return Object.assign(Object.assign({}, matchedProduct.toObject()), { aiReason: aiItem.aiReason, label: aiItem.label });
        })
            .filter(Boolean);
        return res.status(200).json({
            success: true,
            explanation: parsedAiResponse.explanation || '',
            products: finalProducts,
        });
    }
    catch (error) {
        console.error('AI Recommendation Error:', error);
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Something went wrong while fetching gift recommendations',
        });
    }
});
exports.getGiftRecommendations = getGiftRecommendations;
