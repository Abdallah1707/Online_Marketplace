const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  title: { type: String, required: true, unique: true, trim: true },
  description: { type: String },
  price: { type: Number, required: true },
  image: { type: String }, // Product image URL
  deliveryDays: { type: Number, default: 1 }, // Estimated delivery time in days
  seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category' },
  createdAt: { type: Date, default: Date.now },
  flags: [{ type: Schema.Types.ObjectId, ref: 'Flag' }]
});

module.exports = mongoose.model('Product', ProductSchema);
