const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/authMiddleware');
const productController = require('../controllers/productController');
const flagController = require('../controllers/flagController');

router.use(protect, requireRole('seller'));

// Product management
router.get('/products', productController.sellerProducts);
router.post('/products', productController.create);
router.put('/products/:id', productController.update);
router.delete('/products/:id', productController.delete);

// POST /api/seller/categories - Create Category (Seller Only)
router.post('/categories', productController.createCategory);

// DELETE /api/seller/categories/:id - Delete Category (Seller Only)
router.delete('/categories/:id', productController.deleteCategory);

// Flags (seller or admin)
router.post('/flags', flagController.createFlag);

module.exports = router;
