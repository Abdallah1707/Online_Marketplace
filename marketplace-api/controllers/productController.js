const Product = require('../models/Product');

exports.list = async (req, res, next) => {
  try {
    const products = await Product.find().limit(50).populate('category seller');
    res.json(products);
  } catch (err) { next(err); }
};

exports.get = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category seller');
    if (!product) return res.status(404).end();
    res.json(product);
  } catch (err) { next(err); }
};

exports.search = async (req, res, next) => {
  try {
    const q = req.query.q || '';
    const products = await Product.find({ $text: { $search: q } }).limit(50);
    res.json(products);
  } catch (err) { next(err); }
};
