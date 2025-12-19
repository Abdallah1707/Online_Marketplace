const Flag = require('../models/Flag');
const User = require('../models/User');

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

exports.flagSeller = async (req, res, next) => {
  try {
    const { seller, reason } = req.body;
    const reporter = req.user.id;

    const sellerUser = await User.findById(seller);
    if (!sellerUser || sellerUser.role !== 'seller') return res.status(404).json({ error: 'Seller not found' });

    const flag = new Flag({ reporter, target: seller, reason });
    await flag.save();
    await flag.populate('reporter target');
    res.status(201).json(flag);
  } catch (err) { next(err); }
};

exports.flagBuyer = async (req, res, next) => {
  try {
    const { buyer, reason } = req.body;
    const reporter = req.user.id;

    const buyerUser = await User.findById(buyer);
    if (!buyerUser || buyerUser.role !== 'buyer') return res.status(404).json({ error: 'Buyer not found' });

    const flag = new Flag({ reporter, target: buyer, reason });
    await flag.save();
    await flag.populate('reporter target');
    res.status(201).json(flag);
  } catch (err) { next(err); }
};

exports.getSellerFlags = async (req, res, next) => {
  try {
    const sellerId = req.user.id;
    const flags = await Flag.find({ target: sellerId })
      .populate('reporter', 'name email')
      .sort({ createdAt: -1 });
    res.json(flags);
  } catch (err) { next(err); }
};
