const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// TODO: add auth middleware (ensure req.user) before handlers

router.post('/add', cartController.addToCart);          // POST /api/buyer/cart/add
router.get('/', cartController.getCart);               // GET  /api/buyer/cart
router.delete('/item/:productId', cartController.removeFromCart); // DELETE /api/buyer/cart/item/:productId
router.delete('/clear', cartController.clearCart);     // DELETE /api/buyer/cart/clear

module.exports = router;
