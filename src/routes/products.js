// src/routes/products.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/productController');
const requireApiKey = require('../middleware/requireApiKey');
const { upload } = require('../utils/multerUpload'); // << your multer export

// Public listing
router.get('/', ctrl.listProducts);
router.get('/:id', ctrl.getProduct);

// Protected CRUD - use API key
// multer middleware is added here for create & update to accept file uploads
router.post('/', requireApiKey, upload.single('image'), ctrl.createProduct);
router.patch('/:id', requireApiKey, upload.single('image'), ctrl.updateProduct);
router.delete('/:id', requireApiKey, ctrl.deleteProduct);

module.exports = router;
