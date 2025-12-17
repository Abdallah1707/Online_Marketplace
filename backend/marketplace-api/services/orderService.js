const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');

const VALID_STATUSES = ['pending','processing','shipped','delivered','cancelled'];
const TRANSITIONS = {
  pending: ['processing','cancelled'],
  processing: ['shipped','cancelled'],
  shipped: ['delivered','cancelled'],
  delivered: [],
  cancelled: []
};

function ensureUserObj(user) {
  // Accept either id string or user object {id, role}
  if (!user) return null;
  if (typeof user === 'string') return { id: user };
  return user;
}

exports.createOrder = async (user, items = []) => {
  user = ensureUserObj(user);
  if (!user || !user.id) {
    const err = new Error('Not authorized');
    err.status = 401;
    throw err;
  }

  // If no items provided, try to use cart
  if (!Array.isArray(items) || items.length === 0) {
    const cart = await Cart.findOne({ user: user.id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      const err = new Error('No items to create order');
      err.status = 400;
      throw err;
    }
    items = cart.items.map(i => ({ product: i.product._id, quantity: i.quantity }));
  }

  // Validate products and build order items
  const productIds = items.map(i => i.product);
  const products = await Product.find({ _id: { $in: productIds } }).lean();
  if (products.length !== new Set(productIds.map(String)).size) {
    const err = new Error('One or more products not found');
    err.status = 404;
    throw err;
  }

  const orderItems = [];
  let total = 0;
  for (const it of items) {
    const prod = products.find(p => p._id.toString() === it.product.toString());
    if (!prod) {
      const err = new Error('Product not found');
      err.status = 404;
      throw err;
    }
    const qty = Number(it.quantity) || 1;
    if (qty <= 0) {
      const err = new Error('Quantity must be > 0');
      err.status = 400;
      throw err;
    }
    if (prod.seller && prod.seller.toString() === user.id) {
      const err = new Error('Cannot order own product');
      err.status = 400;
      throw err;
    }
    const price = prod.price || 0;
    orderItems.push({ product: prod._id, quantity: qty, price });
    total += price * qty;
  }

  const order = new Order({
    buyer: user.id,
    items: orderItems,
    total,
    status: 'pending'
  });

  await order.save();

  // Clear cart if used
  await Cart.deleteOne({ user: user.id });

  await order.populate([
    { path: 'items.product', select: 'title price seller' },
    { path: 'buyer', select: 'name email' }
  ]); // removed execPopulate()

  return { status: 201, body: order };
};

exports.listBuyerOrders = async (user) => {
  user = ensureUserObj(user);
  if (!user || !user.id) {
    const err = new Error('Not authorized');
    err.status = 401;
    throw err;
  }
  const orders = await Order.find({ buyer: user.id })
    .sort({ createdAt: -1 })
    .populate({ path: 'items.product', select: 'title price seller' })
    .lean();
  return { status: 200, body: orders };
};

exports.getOrder = async (user, orderId) => {
  user = ensureUserObj(user);
  if (!user || !user.id) {
    const err = new Error('Not authorized');
    err.status = 401;
    throw err;
  }
  const order = await Order.findById(orderId)
    .populate({ path: 'items.product', select: 'title price seller' })
    .populate({ path: 'buyer', select: 'name email' });

  if (!order) {
    const err = new Error('Order not found');
    err.status = 404;
    throw err;
  }

  // Admin can view all (role may be set)
  if (user.role === 'admin' || order.buyer._id.toString() === user.id) {
    return { status: 200, body: order };
  }

  // Check if user is a seller owning any product in the order
  const sellerOwns = order.items.some(it => {
    return it.product && it.product.seller && it.product.seller.toString() === user.id.toString();
  });
  if (sellerOwns) return { status: 200, body: order };

  const err = new Error('Forbidden');
  err.status = 403;
  throw err;
};

exports.listSellerOrders = async (user, status) => {
  user = ensureUserObj(user);
  if (!user || !user.id) {
    const err = new Error('Not authorized');
    err.status = 401;
    throw err;
  }

  // Find products sold by seller
  const products = await Product.find({ seller: user.id }).select('_id').lean();
  const prodIds = products.map(p => p._id);
  if (prodIds.length === 0) return { status: 200, body: [] };

  const query = { 'items.product': { $in: prodIds } };
  if (status && VALID_STATUSES.includes(status)) query.status = status;

  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .populate({ path: 'items.product', select: 'title price seller' })
    .populate({ path: 'buyer', select: 'name email' })
    .lean();

  return { status: 200, body: orders };
};

exports.updateOrderStatus = async (user, orderId, newStatus) => {
  user = ensureUserObj(user);
  if (!user || !user.id) {
    const err = new Error('Not authorized');
    err.status = 401;
    throw err;
  }
  if (!newStatus || !VALID_STATUSES.includes(newStatus)) {
    const err = new Error('Invalid status');
    err.status = 400;
    throw err;
  }

  const order = await Order.findById(orderId).populate({ path: 'items.product', select: 'seller title' }); // added title for context
  if (!order) {
    const err = new Error('Order not found');
    err.status = 404;
    throw err;
  }

  console.log('Order:', order._id, 'Buyer:', order.buyer, 'Items:', order.items.map(it => ({ product: it.product ? it.product._id : 'no product', seller: it.product ? it.product.seller : 'no seller' })));
  console.log('User:', user.id, 'Role:', user.role);

  // Admin may update any order
    if (user.role !== 'admin') {
        // Seller may update only if they own items in the order
        const sellerOwns = order.items.some(it => {
        return it.product && it.product.seller && it.product.seller.toString() === user.id.toString();
        });
        if (!sellerOwns) {
        const err = new Error('Forbidden');
        err.status = 403;
        throw err;
        }
  }

  // Validate transition
  const current = order.status;
  if (current === newStatus) {
    return { status: 200, body: order };
  }
  if (!(TRANSITIONS[current].includes(newStatus) || newStatus === 'cancelled')) {
    const err = new Error(`Invalid status transition from ${current} to ${newStatus}`);
    err.status = 400;
    throw err;
  }

  order.status = newStatus;
  await order.save();
  await order.populate({ path: 'items.product', select: 'title price seller' });
  return { status: 200, body: order };
};

