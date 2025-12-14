const express = require('express');
const orderController = require('../controllers/orderController');

// Buyer router
const buyerRouter = express.Router();
buyerRouter.post('/', orderController.createOrder);      // POST /api/buyer/orders
buyerRouter.get('/', orderController.listBuyerOrders);   // GET  /api/buyer/orders
buyerRouter.get('/:id', orderController.getOrder);       // GET  /api/buyer/orders/:id

// Seller router
const sellerRouter = express.Router();
sellerRouter.get('/', orderController.listSellerOrders);         // GET  /api/seller/orders?status=...
sellerRouter.put('/:id/status', orderController.updateOrderStatus); // PUT /api/seller/orders/:id/status

module.exports = { buyer: buyerRouter, seller: sellerRouter };
