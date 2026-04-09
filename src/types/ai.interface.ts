export interface IAiRecommendRequest {
  person: string;
  occasion: string;
  budget: string;
  interests?: string[];
}

export interface IAiRecommendedProduct {
  _id: string;
  aiReason: string;
  label: string;
}

export interface IAiRecommendResponse {
  success: boolean;
  explanation: string;
  products: IAiRecommendedProduct[];
  message?: string; 
}
