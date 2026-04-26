import { Request, Response } from 'express';
import { Product } from '../model/product/product.model';
import { Types } from 'mongoose';

// User Get Products
const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { category, search, rating, sort, page = '1', limit = '9' } = req.query;

    const filter: Record<string, unknown> = {
      status: 'Active',
    };

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (search) {
      filter.$or = [{ name: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }];
    }

    if (rating === '4-up') {
      filter.rating = { $gte: 4 };
    }

    if (rating === '4.5-up') {
      filter.rating = { $gte: 4.5 };
    }

    let sortOption: Record<string, 1 | -1> = {};
    if (sort === 'low-to-high') {
      sortOption = { price: 1 };
    } else if (sort === 'high-to-low') {
      sortOption = { price: -1 };
    } else {
      sortOption = { createdAt: -1 };
    }

    const currentPage = Number(page) || 1;
    const perPage = Number(limit) || 9;
    const skip = (currentPage - 1) * perPage;

    const products = await Product.find(filter).sort(sortOption).skip(skip).limit(perPage);

    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / perPage);

    res.status(200).json({
      success: true,
      message: 'Public products fetched successfully',
      meta: {
        totalProducts,
        totalPages,
        currentPage,
        perPage,
      },
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch public products',
      error,
    });
  }
};

// User Product Details / Single Product
const getProductDetails = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    // invalid mongo id
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product id',
      });
    }

    // only active products
    const product = await Product.findOne({
      _id: id,
      status: 'Active',
    });

    // if not getting product
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // 4. success response
    return res.status(200).json({
      success: true,
      message: 'Product details fetched successfully',
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch product details',
      error,
    });
  }
};

export const ProductController = {
  getAllProducts,
  getProductDetails,
};
