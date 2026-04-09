import express from 'express';
import { getGiftRecommendations } from '../controller/ai.controller';

const router = express.Router();

router.post('/recommend', getGiftRecommendations);

export const AiRoutes = router;
