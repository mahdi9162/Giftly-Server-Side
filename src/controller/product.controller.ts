import { Request, Response } from 'express';
import { Product } from '../model/product/product.model';

// Create Products
const createProduct = async (req: Request, res: Response) => {
  try {
    const productData = req.body;
    const { name, category } = productData;

    const existingProduct = await Product.findOne({ name, category });

    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: 'A product with this name already exists in this category',
      });
    }

    const newProduct = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: newProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error,
    });
  }
};

// Get All Products
const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { category, search, rating, status, sort, page = '1', limit = '9' } = req.query;

    const filter: Record<string, unknown> = {};

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

    if (status && status !== 'All') {
      filter.status = status;
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
    const activeProducts = await Product.countDocuments({
      ...filter,
      status: 'Active',
    });
    const draftProducts = await Product.countDocuments({
      ...filter,
      status: 'Draft',
    });

    const outOfStockProducts = await Product.countDocuments({
      ...filter,
      status: 'Out of Stock',
    });

    res.status(200).json({
      success: true,
      message: 'Products fetched successfully',
      meta: {
        totalProducts,
        totalPages,
        currentPage,
        perPage,
        activeProducts,
        draftProducts,
        outOfStockProducts,
      },
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
  createProduct,
  getAllProducts,
};
