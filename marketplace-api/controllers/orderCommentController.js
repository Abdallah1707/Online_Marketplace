const OrderComment = require('../models/OrderComment');
const Order = require('../models/Order');

exports.addOrderComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const userId = req.user.id;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.buyer.toString() !== userId.toString()) return res.status(403).json({ error: 'Forbidden' });

    const newComment = new OrderComment({ user: userId, order: id, comment });
    await newComment.save();
    await newComment.populate('user order');
    res.status(201).json(newComment);
  } catch (err) { next(err); }
};
