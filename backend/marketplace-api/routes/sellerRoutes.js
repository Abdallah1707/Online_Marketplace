const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/authMiddleware');
const productController = require('../controllers/productController');
const flagController = require('../controllers/flagController');
const orderController = require('../controllers/orderController');
const orderCommentController = require('../controllers/orderCommentController');

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

// Order management
router.get('/orders', orderController.listSellerOrders);
router.put('/orders/:id/status', orderController.updateOrderStatus);
router.get('/orders/:id/comments', orderCommentController.getOrderComments);

// Flags (seller or admin)
router.post('/flags', flagController.createFlag);
router.post('/flags/buyer', flagController.flagBuyer);
router.get('/flags', flagController.getSellerFlags);
router.patch('/flags/:id/resolve', flagController.resolveFlag);
router.delete('/flags/:id', flagController.deleteFlag);

module.exports = router;
