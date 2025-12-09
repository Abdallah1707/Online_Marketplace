const Flag = require('../models/Flag');

exports.createFlag = async (req, res, next) => {
  try {
    const { productId, reason } = req.body;
    const flag = new Flag({ reporter: req.user.id, product: productId, reason });
    await flag.save();
    res.status(201).json(flag);
  } catch (err) { next(err); }
};

exports.listFlags = async (req, res, next) => {
  try {
    const flags = await Flag.find().populate('reporter product');
    res.json(flags);
  } catch (err) { next(err); }
};
