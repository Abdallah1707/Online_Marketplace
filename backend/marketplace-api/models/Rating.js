const mongoose = require('mongoose');
const { Schema } = mongoose;

const RatingSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  rating: { type: Number, required: true, min: 0, max: 5 },
  comment: String,
}, { timestamps: true });

module.exports = mongoose.models.Rating || mongoose.model('Rating', RatingSchema);
