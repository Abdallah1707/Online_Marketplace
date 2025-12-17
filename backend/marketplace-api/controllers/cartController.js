const cartService = require('../services/cartService');

exports.addToCart = async (req, res, next) => {
  try {
    const user = req.user; // pass full user object { id, role, ... }
    const { productId, quantity } = req.body;
    const result = await cartService.addToCart(user, productId, quantity);
    res.status(result.status || 200).json(result.body || result);
  } catch (err) { next(err); }
};

exports.getCart = async (req, res, next) => {
  try {
    const user = req.user;
    const result = await cartService.getCart(user);
    res.status(result.status || 200).json(result.body || result);
  } catch (err) { next(err); }
};

exports.removeFromCart = async (req, res, next) => {
  try {
    const user = req.user;
    const { productId } = req.params;
    const result = await cartService.removeFromCart(user, productId);
    res.status(result.status || 200).json(result.body || result);
  } catch (err) { next(err); }
};

exports.clearCart = async (req, res, next) => {
  try {
    const user = req.user;
    const result = await cartService.clearCart(user);
    res.status(result.status || 200).json(result.body || result);
  } catch (err) { next(err); }
};
