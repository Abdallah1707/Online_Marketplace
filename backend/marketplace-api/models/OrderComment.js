const mongoose = require('mongoose');
const { Schema } = mongoose;

const OrderCommentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  comment: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.models.OrderComment || mongoose.model('OrderComment', OrderCommentSchema);
