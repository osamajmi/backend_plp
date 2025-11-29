const Product = require('../models/Product');
const { deleteFileIfExists } = require('../utils/multerUpload');
const path = require('path');

// GET /api/products  (unchanged)
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

// GET /api/products/:id (unchanged)
exports.getProduct = async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Product not found' });
    res.json(p);
  } catch (err) {
    res.status(400).json({ message: 'Invalid ID', error: err.message });
  }
};

// POST /api/products  (use req.file)
exports.createProduct = async (req, res) => {
  try {
    console.log("hit");
    const { title, description, price, rating } = req.body;
    console.log(req.body);

    let image = null;

    if (req.file) {
      // Save only relative path — not full system path
      image = `uploads/${req.file.filename}`;
    } else if (req.body.image) {
      image = req.body.image;
    }

    const product = new Product({
      title,
      description,
      price,
      rating,
      image
    });

    const saved = await product.save();
    res.status(201).json(saved);

  } catch (err) {
    res.status(400).json({ message: 'Create failed', error: err.message });
  }
};

// PUT /api/products/:id (handle file replacement)
exports.updateProduct = async (req, res) => {
  try {
    const updates = { ...req.body };

    // if a new file was uploaded, set updates.image and remove old file
    if (req.file) {
      updates.image = req.file.path;
    }

    // Find current product so we can remove old image if replaced
    const existing = await Product.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Product not found' });

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    // If new file uploaded and existing.image exists -> delete old file
    if (req.file && existing.image && existing.image !== updates.image) {
      // if existing.image is a URL (cloud) you might need to handle differently
      await deleteFileIfExists(existing.image);
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: 'Update failed', error: err.message });
  }
};

// DELETE /api/products/:id 
exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Product not found' });

    // delete image
    if (deleted.image) {
      await deleteFileIfExists(deleted.image);
    }

    res.json({ message: 'Deleted', id: deleted._id });
  } catch (err) {
    res.status(400).json({ message: 'Delete failed', error: err.message });
  }
};
