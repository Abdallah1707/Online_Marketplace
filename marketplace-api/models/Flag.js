const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FlagSchema = new Schema({
  reporter: { type: Schema.Types.ObjectId, ref: 'User' },
  product: { type: Schema.Types.ObjectId, ref: 'Product' },
  reason: String,
  resolved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Flag', FlagSchema);
