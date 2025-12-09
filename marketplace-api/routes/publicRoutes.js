const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Product browsing
router.get('/products', productController.list);
router.get('/products/:id', productController.get);
router.get('/products/:id/summary', productController.getCommentSummary);
router.get('/search', productController.search);

// Category browsing
router.get('/categories', productController.listCategories);
router.get('/categories/:id', productController.getCategoryWithProducts);

module.exports = router;
