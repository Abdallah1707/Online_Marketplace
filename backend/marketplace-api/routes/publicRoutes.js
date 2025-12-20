const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const aiController = require('../controllers/aiController'); // Added import
const commentController = require('../controllers/commentController'); // Added import

// Product browsing
router.get('/products', productController.list);
router.get('/products/:id', productController.get);
router.get('/products/:id/summary', aiController.summarizeComments); // Added summary route
router.get('/products/:id/comments', commentController.getProductComments); // Added comments fetch route
router.get('/search', productController.search);

// Category browsing
router.get('/categories', productController.listCategories);
router.get('/categories/:id', productController.getCategoryWithProducts);

module.exports = router;
