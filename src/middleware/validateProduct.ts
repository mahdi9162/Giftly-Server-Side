import { NextFunction, Request, Response } from 'express';

export const validateProduct = (req: Request, res: Response, next: NextFunction) => {
  const { name, category, description, price, image, alt, stock, featured, featuredOrder } = req.body;

  //   Required fields check
  if (!name || !category || !description || !price || !image || !alt || stock === undefined) {
    return res.status(400).json({
      success: false,
      message: 'All required fields must be provided',
    });
  }

  // Type checks
  if (typeof price !== 'number' || price < 0) {
    return res.status(400).json({
      success: false,
      message: 'Price must be a positive number',
    });
  }

  if (typeof stock !== 'number' || stock < 0) {
    return res.status(400).json({
      success: false,
      message: 'Stock must be a positive number',
    });
  }

  // Featured logic
  if (featured === true && (featuredOrder === undefined || featuredOrder < 1)) {
    return res.status(400).json({
      success: false,
      message: 'featuredOrder is required when featured is true',
    });
  }

  next();
};
