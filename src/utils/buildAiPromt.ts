type BuildAIPromptParams = {
  person: string;
  occasion: string;
  budget: string;
  interests?: string[];
  aiProductContext: {
    _id: string;
    name: string;
    category: string;
    description: string;
    price: number;
    rating: number;
    reviews: number;
  }[];
};

export const buildAIPrompt = ({ person, occasion, budget, interests, aiProductContext }: BuildAIPromptParams) => {
  return `
You are an AI gift recommendation assistant for an ecommerce website.

A user is looking for a gift with the following preferences:
- Person: ${person}
- Occasion: ${occasion}
- Budget: ${budget}
- Interests: ${interests?.join(', ') || 'None'}

Here is a list of REAL products from our database:
${JSON.stringify(aiProductContext, null, 2)}

Your job:
1. Select the best 3 matching products only from the provided product list.
2. Do NOT invent or create any new product.
3. Use the product's name, category, description, price, rating, and reviews to decide.
4. Prefer products that feel relevant to the person, occasion, budget, and interests.
5. Return a short overall explanation of why these suggestions fit.
6. For each selected product, return:
   - _id
   - aiReason
   - label

Label should be one of:
- Thoughtful Pick
- Balanced Choice
- Premium Feel
- Sentimental Gift
- Smart Match

Return ONLY valid JSON in this exact format:
{
  "explanation": "string",
  "products": [
    {
      "_id": "string",
      "aiReason": "string",
      "label": "string"
    }
  ]
}
`;
};
