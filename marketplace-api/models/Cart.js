const mongoose = require('mongoose');
const { Schema } = mongoose;

const CartItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, default: 1, required: true },
  price: { type: Number, required: true }, // snapshot price
  subtotal: { type: Number, required: true }
}, { _id: false });

const CartSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [CartItemSchema],
  totalPrice: { type: Number, default: 0 },
  totalItems: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.models.Cart || mongoose.model('Cart', CartSchema);
