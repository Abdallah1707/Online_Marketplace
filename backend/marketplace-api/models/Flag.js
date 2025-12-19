const mongoose = require('mongoose');
const { Schema } = mongoose;

const FlagSchema = new Schema({
  reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  target: { type: Schema.Types.ObjectId, ref: 'User' }, // User being flagged (buyer or seller) - optional
  product: { type: Schema.Types.ObjectId, ref: 'Product' }, // Product being flagged - optional
  reason: { type: String, required: true },
  resolved: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.models.Flag || mongoose.model('Flag', FlagSchema);
