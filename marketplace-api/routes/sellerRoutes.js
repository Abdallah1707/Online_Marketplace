const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/authMiddleware');
const productController = require('../controllers/productController');
const flagController = require('../controllers/flagController');

router.use(protect, requireRole('seller'));
// Seller can manage products - placeholder endpoints
router.get('/products', productController.list);

// Flags (seller or admin)
router.post('/flags', flagController.createFlag);

module.exports = router;
