const Rating = require('../models/Rating');
const Product = require('../models/Product');

exports.rateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const existingRating = await Rating.findOne({ user: userId, product: id });
    if (existingRating) return res.status(400).json({ error: 'Already rated this product' });

    const newRating = new Rating({ user: userId, product: id, rating, comment });
    await newRating.save();
    await newRating.populate('user product');
    res.status(201).json(newRating);
  } catch (err) { next(err); }
};
