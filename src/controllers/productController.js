const Product = require('../models/Product');
const path = require('path');
const cloudinary = require('../utils/cloudinary.js');
// const { deleteFileIfExists } = require('../utils/multerUpload.js');
// const Product = require('../models/Product');
const { uploadToCloudinary, deleteFileIfExists } = require('../utils/multerUpload');


exports.listProducts = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "" } = req.query;
    page = Number(page);
    limit = Number(limit);

    const searchFilter = search
      ? {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } }
          ]
        }
      : {};

    const totalProducts = await Product.countDocuments(searchFilter);

    const products = await Product.find(searchFilter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      page,
      limit,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      products
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Product not found' });
    res.json(p);
  } catch (err) {
    res.status(400).json({ message: 'Invalid ID', error: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { title, description, price, rating } = req.body;
    let image = null;

    if (req.file && req.file.buffer) {
      const result = await uploadToCloudinary(req.file.buffer, 'products');
      image = result.secure_url;
    } else if (req.body.image) {
      image = req.body.image;
    }

    if (!image) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const product = new Product({ title, description, price, rating, image });
    const saved = await product.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: 'Create failed', error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const updates = { ...req.body };
    const existing = await Product.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Product not found' });

    if (req.file && req.file.buffer) {
      const result = await uploadToCloudinary(req.file.buffer, 'products');
      updates.image = result.secure_url;
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: 'Update failed', error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Product not found' });

    if (deleted.image) await deleteFileIfExists(deleted.image);

    res.json({ message: 'Deleted', id: deleted._id });
  } catch (err) {
    res.status(400).json({ message: 'Delete failed', error: err.message });
  }
};
