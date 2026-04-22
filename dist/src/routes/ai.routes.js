"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiRoutes = void 0;
const express_1 = __importDefault(require("express"));
const ai_controller_1 = require("../controller/ai.controller");
const router = express_1.default.Router();
router.post('/recommend', ai_controller_1.getGiftRecommendations);
exports.AiRoutes = router;
