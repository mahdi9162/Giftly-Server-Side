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

// Get Products
const getAdminProducts = async (req: Request, res: Response) => {
  try {
    const { search, status, page = '1', limit = '9' } = req.query;

    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [{ name: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }];
    }
    if (status === 'Out of Stock') {
      filter.stock = { $lte: 0 };
    } else if (status && status !== 'All') {
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
    const outOfStockProducts = await Product.countDocuments({ stock: { $lte: 0 } });

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

// Get Single products
const getAdminProductById = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    // invalid mongo id
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product id',
      });
    }

    // find products
    const product = await Product.findById(id).lean();

    // if not found
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

    const updateData: Record<string, unknown> = {};

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
      message: 'Failed to update product',
      error,
    });
  }
};

// Delete Product
const deleteProduct = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    // invalid mongo id
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product id',
      });
    }

    // find product
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // 4. success response
    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
      error,
    });
  }
};

// low stock products
const getLowStockProducts = async (req: Request, res: Response) => {
  try {
    const filter = { stock: { $lte: 8 }, status: 'Active' };

    const products = await Product.find(filter).select('_id name category stock').sort({ stock: 1 });

    if (products.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No low stock products available in this moment!',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Low stock products data fetched successfully',
      data: products,
    });
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch low stock products data',
    });
  }
};

export const AdminProductController = {
  createProduct,
  getAdminProducts,
  getAdminProductById,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
};
