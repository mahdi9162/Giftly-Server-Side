import { Request, Response } from 'express';
import { Product } from '../model/product/product.model';
import { Types } from 'mongoose';

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

// Admin Get Products
const getAdminProducts = async (req: Request, res: Response) => {
  try {
    const { search, status, page = '1', limit = '9' } = req.query;

    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [{ name: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }];
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    const currentPage = Number(page) || 1;
    const perPage = Number(limit) || 9;
    const skip = (currentPage - 1) * perPage;

    const products = await Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(perPage);

    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / perPage);

    const activeProducts = await Product.countDocuments({ status: 'Active' });
    const draftProducts = await Product.countDocuments({ status: 'Draft' });
    const outOfStockProducts = await Product.countDocuments({ status: 'Out of Stock' });

    res.status(200).json({
      success: true,
      message: 'Admin products fetched successfully',
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
      message: 'Failed to fetch admin products',
      error,
    });
  }
};

// Product Details
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

// Update Product
const updateProduct = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    //check invalid mongo id
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product id',
      });
    }

    //check product exists
    const existingProduct = await Product.findById(id);

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const allowedFields = ['name', 'category', 'price', 'stock', 'image', 'alt', 'description', 'status', 'featured', 'featuredOrder'];

    const updateData: Record<string, any> = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // update product
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true, // updated data return
      runValidators: true, // mongoose validation
    });

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
      error,
    });
  }
};



export const ProductController = {
  createProduct,
  getAllProducts,
  getAdminProducts,
  getProductDetails,
  updateProduct,
};
