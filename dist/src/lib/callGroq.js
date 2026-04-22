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
exports.callGroq = void 0;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const config_1 = __importDefault(require("../config"));
const callGroq = (prompt) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    if (!config_1.default.groq_api_key) {
        throw new Error('GROQ_API_KEY is not set in environment');
    }
    const groq = new groq_sdk_1.default({
        apiKey: config_1.default.groq_api_key,
    });
    try {
        const completion = yield groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.3,
            max_tokens: 800,
        });
        return ((_d = (_c = (_b = (_a = completion.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content) === null || _d === void 0 ? void 0 : _d.trim()) || '';
    }
    catch (error) {
        console.error('Groq Error:', error);
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error('Failed to get response from Groq');
    }
});
exports.callGroq = callGroq;
