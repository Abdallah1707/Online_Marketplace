const Cart = require('../models/Cart');
const Product = require('../models/Product');

async function recalcCart(cart) {
  let totalPrice = 0;
  let totalItems = 0;
  for (const it of cart.items) {
    it.subtotal = it.price * it.quantity;
    totalPrice += it.subtotal;
    totalItems += it.quantity;
  }
  cart.totalPrice = totalPrice;
  cart.totalItems = totalItems;
  return cart;
}

exports.addToCart = async (user, productId, quantity = 1) => {
  if (!user || !user.id) {
    const err = new Error('Not authorized');
    err.status = 401;
    throw err;
  }
  if (!productId) {
    const err = new Error('productId is required');
    err.status = 400;
    throw err;
  }
  quantity = Number(quantity) || 1;
  if (quantity <= 0) {
    const err = new Error('Quantity must be > 0');
    err.status = 400;
    throw err;
  }

  const product = await Product.findById(productId).lean();
  if (!product) {
    const err = new Error('Product not found');
    err.status = 404;
    throw err;
  }
  if (product.seller && product.seller.toString() === user.id) {
    const err = new Error('Seller cannot add their own product to cart');
    err.status = 400;
    throw err;
  }

  let cart = await Cart.findOne({ user: user.id }).populate({ path: 'items.product', select: 'seller' });
  if (!cart) {
    cart = new Cart({ user: user.id, items: [] });
  }

  // Enforce same seller: if cart has items, check if new product's seller matches
  if (cart.items.length > 0) {
    const existingSeller = cart.items[0].product.seller.toString(); // Assuming populated or stored
    if (product.seller.toString() !== existingSeller) {
      const err = new Error('Cart can only contain products from the same seller');
      err.status = 400;
      throw err;
    }
  }

  const idx = cart.items.findIndex(i => i.product.toString() === productId.toString());
  if (idx >= 0) {
    cart.items[idx].quantity += quantity;
    cart.items[idx].price = product.price;
    cart.items[idx].subtotal = cart.items[idx].price * cart.items[idx].quantity;
  } else {
    cart.items.push({
      product: product._id,
      quantity,
      price: product.price,
      subtotal: product.price * quantity
    });
  }

  await recalcCart(cart);
  await cart.save();
  await cart.populate({ path: 'items.product', select: 'title price seller' });

  return { status: 200, body: { message: 'Added to cart', cart } };
};

exports.getCart = async (user) => {
  if (!user || !user.id) {
    const err = new Error('Not authorized');
    err.status = 401;
    throw err;
  }
  const cart = await Cart.findOne({ user: user.id }).populate({ path: 'items.product', select: 'title price seller' }).lean();
  if (!cart) return { status: 200, body: { items: [], totalPrice: 0, totalItems: 0 } };
  return { status: 200, body: cart };
};

exports.removeFromCart = async (user, productId) => {
  if (!user || !user.id) {
    const err = new Error('Not authorized');
    err.status = 401;
    throw err;
  }
  if (!productId) {
    const err = new Error('productId is required');
    err.status = 400;
    throw err;
  }

  const cart = await Cart.findOne({ user: user.id });
  if (!cart) {
    const err = new Error('Cart not found');
    err.status = 404;
    throw err;
  }
  cart.items = cart.items.filter(i => i.product.toString() !== productId.toString());
  if (cart.items.length === 0) {
    await Cart.deleteOne({ _id: cart._id });
    return { status: 200, body: { message: 'Cart cleared' } };
  }
  await recalcCart(cart);
  await cart.save();
  await cart.populate({ path: 'items.product', select: 'title price seller' });
  return { status: 200, body: cart };
};

exports.clearCart = async (user) => {
  if (!user || !user.id) {
    const err = new Error('Not authorized');
    err.status = 401;
    throw err;
  }
  await Cart.deleteOne({ user: user.id });
  return { status: 200, body: { message: 'Cart cleared' } };
};
