import { Request, Response } from 'express';
import { IAiRecommendRequest } from '../types/ai.interface';
import { parseBudgetRange } from '../lib/parseBudget';
import { Product } from '../model/product/product.model';
import { getPreferredCategories } from '../services/ai.service';
import { buildAIPrompt } from '../utils/buildAiPromt';
import { callGroq } from '../lib/callGroq';

export const getGiftRecommendations = async (req: Request, res: Response) => {
  try {
    const body = req.body as IAiRecommendRequest;
    const { person, occasion, budget, interests } = body;

    console.log('AI Request Body:', body);

    const { minPrice, maxPrice } = parseBudgetRange(budget);
    console.log('Parsed Budget:', { minPrice, maxPrice });

    const preferredCategories = getPreferredCategories(occasion, person);
    console.log('Preferred Categories:', preferredCategories);

    let candidateProducts = await Product.find({
      status: 'Active',
      stock: { $gt: 0 },
      price: { $gte: minPrice, $lte: maxPrice },
      category: { $in: preferredCategories },
    });

    if (candidateProducts.length === 0) {
      console.log('Fallback: broad search');

      candidateProducts = await Product.find({
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

    const prompt = buildAIPrompt({
      person,
      occasion,
      budget,
      interests,
      aiProductContext,
    });

    const rawAiResponse = await callGroq(prompt);
    console.log('Raw AI Response:', rawAiResponse);

    const cleanedAiResponse = rawAiResponse
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    console.log('Cleaned AI Response:', cleanedAiResponse);

    let parsedAiResponse: {
      explanation?: string;
      products?: { _id: string; aiReason: string; label: string }[];
    };

    try {
      parsedAiResponse = JSON.parse(cleanedAiResponse);
    } catch (error) {
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

        if (!matchedProduct) return null;

        return {
          ...matchedProduct.toObject(),
          aiReason: aiItem.aiReason,
          label: aiItem.label,
        };
      })
      .filter(Boolean);

    return res.status(200).json({
      success: true,
      explanation: parsedAiResponse.explanation || '',
      products: finalProducts,
    });
  } catch (error) {
    console.error('AI Recommendation Error:', error);

    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Something went wrong while fetching gift recommendations',
    });
  }
};
