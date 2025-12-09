const Order = require('../models/Order');

exports.createOrder = async (req, res, next) => {
  try {
    const { items } = req.body;
    const order = new Order({ buyer: req.user.id, items });
    // TODO: compute total
    await order.save();
    res.status(201).json(order);
  } catch (err) { next(err); }
};

exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) return res.status(404).end();
    res.json(order);
  } catch (err) { next(err); }
};
