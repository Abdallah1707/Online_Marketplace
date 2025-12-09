const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/products', productController.list);
router.get('/products/:id', productController.get);
router.get('/search', productController.search);

module.exports = router;
