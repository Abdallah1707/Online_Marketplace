const orderService = require('../services/orderService');

// Buyer: create order (checkout)
exports.createOrder = async (req, res, next) => {
  try {
    const user = req.user;
    const { items } = req.body;
    const result = await orderService.createOrder(user, items);
    res.status(result.status || 201).json(result.body || result);
  } catch (err) { next(err); }
};

// Buyer: list own orders
exports.listBuyerOrders = async (req, res, next) => {
  try {
    const user = req.user;
    const result = await orderService.listBuyerOrders(user);
    res.status(result.status || 200).json(result.body || result);
  } catch (err) { next(err); }
};

// Buyer/Admin: get single order
exports.getOrder = async (req, res, next) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const result = await orderService.getOrder(user, id);
    res.status(result.status || 200).json(result.body || result);
  } catch (err) { next(err); }
};

// Seller: list orders relevant to seller (query param status optional)
exports.listSellerOrders = async (req, res, next) => {
  try {
    const user = req.user;
    const { status } = req.query;
    const result = await orderService.listSellerOrders(user, status);
    res.status(result.status || 200).json(result.body || result);
  } catch (err) { next(err); }
};

// Seller/Admin: update order status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { status } = req.body;
    const result = await orderService.updateOrderStatus(user, id, status);
    res.status(result.status || 200).json(result.body || result);
  } catch (err) { next(err); }
};
