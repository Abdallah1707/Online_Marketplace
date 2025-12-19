const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/authMiddleware');
const orderController = require('../controllers/orderController');
const ratingController = require('../controllers/ratingController');
const flagController = require('../controllers/flagController');
const orderCommentController = require('../controllers/orderCommentController');
const commentController = require('../controllers/commentController');

router.use(protect);
router.post('/orders', orderController.createOrder);
router.get('/orders/:id', orderController.getOrder);
router.post('/products/:id/rate', protect, ratingController.rateProduct);
router.post('/products/:id/comment', protect, commentController.addProductComment);
router.post('/flags/seller', protect, flagController.flagSeller);
router.post('/flags/product', protect, flagController.flagProduct);
router.get('/flags', flagController.getBuyerFlags);
router.delete('/flags/:id', flagController.deleteBuyerFlag);
router.post('/orders/:id/comment', protect, orderCommentController.addOrderComment);

module.exports = router;
