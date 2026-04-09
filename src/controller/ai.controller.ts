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

    // step 1: budget string → min/max number
    const { minPrice, maxPrice } = parseBudgetRange(budget);

    // 3) Occasion + find out the preferred categories according to the person.
    const preferredCategories = getPreferredCategories(occasion, person);

    console.log('Preferred Categories:', preferredCategories);

    console.log('AI Request Data:', {
      person,
      occasion,
      budget,
      interests,
      minPrice,
      maxPrice,
    });

    // 4) Retrieve initial candidate products from the database
    const candidateProducts = await Product.find({
      status: 'Active',
      stock: { $gt: 0 },
      price: { $gte: minPrice, $lte: maxPrice },
      category: { $in: preferredCategories },
    }).select('_id name category description price rating reviews image alt stock status');

    // 5) Compacted product data for Groq
    const aiProductContext = candidateProducts.map((product) => ({
      _id: product._id.toString(),
      name: product.name,
      category: product.category,
      description: product.description,
      price: product.price,
      rating: product.rating,
      reviews: product.reviews,
    }));

    console.log('AI Product Context:', aiProductContext);

    // 6) If no matching product is found
    if (aiProductContext.length === 0) {
      return res.status(200).json({
        success: false,
        explanation: 'No suitable products were found for this combination of budget, occasion, and person.',
        products: [],
        message: 'Try a different budget or broader gift preferences.',
      });
    }

    // 7) built the final prompt for Groq
    const prompt = buildAIPrompt({
      person,
      occasion,
      budget,
      interests,
      aiProductContext,
    });

    console.log('Groq Prompt:', prompt);

    const rawAiResponse = await callGroq(prompt);

    const cleanedAiResponse = rawAiResponse
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const parsedAiResponse = JSON.parse(cleanedAiResponse);

    const finalProducts = parsedAiResponse.products.map((aiItem: any) => {
      const matchedProduct = candidateProducts.find((product) => product._id.toString() === aiItem._id);

      return {
        ...matchedProduct?.toObject(),
        aiReason: aiItem.aiReason,
        label: aiItem.label,
      };
    });

    return res.status(200).json({
      success: true,
      explanation: parsedAiResponse.explanation,
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
