export type ProductCategory = 'birthday' | 'anniversary' | 'for-him' | 'for-her' | 'family' | 'personalized';

export type ProductBadge = 'Best Seller' | 'New';
export type status = 'Active' | 'Draft' | 'Out of Stock';

export interface IProduct {
  _id: string;
  name: string;
  category: ProductCategory;
  description: string;
  price: number;
  rating: number;
  reviews: number;
  badge?: ProductBadge;
  image: string;
  alt: string;
  stock: number;
  status: string;
  featured?: boolean;
  featuredOrder?: number;
}
