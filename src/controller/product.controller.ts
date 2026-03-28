import { Request, Response } from 'express';
import { Product } from '../model/product/product.model';

const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find();

    res.status(200).json({
      success: true,
      message: 'Products fetched successfully',
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error,
    });
  }
};

export const ProductController = {
  getAllProducts,
};
