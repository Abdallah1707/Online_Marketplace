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

exports.flagProduct = async (req, res, next) => {
  try {
    const { product, reason } = req.body;
    const reporter = req.user.id;

    // Check if buyer already flagged this product
    const existingFlag = await Flag.findOne({ reporter, product });
    if (existingFlag) {
      return res.status(400).json({ error: 'You have already flagged this product' });
    }

    const flag = new Flag({ reporter, product, reason });
    await flag.save();
    await flag.populate('reporter product');
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
    const Product = require('../models/Product');
    
    // Get all products belonging to this seller
    const sellerProducts = await Product.find({ seller: sellerId }).select('_id');
    const productIds = sellerProducts.map(p => p._id);
    
    // Find flags where either:
    // 1. The seller is the target (direct seller flags)
    // 2. The product belongs to the seller (product flags)
    const flags = await Flag.find({
      $or: [
        { target: sellerId },
        { product: { $in: productIds } }
      ]
    })
      .populate('reporter', 'name email')
      .populate('product', 'title')
      .sort({ createdAt: -1 });
    
    res.json(flags);
  } catch (err) { next(err); }
};

exports.resolveFlag = async (req, res, next) => {
  try {
    const flagId = req.params.id;
    const sellerId = req.user.id;
    const Product = require('../models/Product');
    
    const flag = await Flag.findById(flagId).populate('product');
    if (!flag) return res.status(404).json({ error: 'Flag not found' });
    
    // Check if seller can resolve this flag
    let canResolve = false;
    
    // If it's a direct seller flag
    if (flag.target && flag.target.toString() === sellerId.toString()) {
      canResolve = true;
    }
    
    // If it's a product flag, check if the product belongs to this seller
    if (flag.product) {
      const product = await Product.findById(flag.product._id || flag.product);
      if (product && product.seller.toString() === sellerId.toString()) {
        canResolve = true;
      }
    }
    
    if (!canResolve) {
      return res.status(403).json({ error: 'You can only resolve flags against yourself or your products' });
    }
    
    flag.resolved = true;
    await flag.save();
    await flag.populate('reporter', 'name email');
    await flag.populate('product', 'title');
    
    res.json(flag);
  } catch (err) { next(err); }
};

exports.deleteFlag = async (req, res, next) => {
  try {
    const flagId = req.params.id;
    const sellerId = req.user.id;
    const Product = require('../models/Product');
    
    const flag = await Flag.findById(flagId).populate('product');
    if (!flag) return res.status(404).json({ error: 'Flag not found' });
    
    // Check if seller can delete this flag
    let canDelete = false;
    
    // If it's a direct seller flag
    if (flag.target && flag.target.toString() === sellerId.toString()) {
      canDelete = true;
    }
    
    // If it's a product flag, check if the product belongs to this seller
    if (flag.product) {
      const product = await Product.findById(flag.product._id || flag.product);
      if (product && product.seller.toString() === sellerId.toString()) {
        canDelete = true;
      }
    }
    
    if (!canDelete) {
      return res.status(403).json({ error: 'You can only delete flags against yourself or your products' });
    }
    
    await Flag.findByIdAndDelete(flagId);
    res.json({ message: 'Flag deleted successfully' });
  } catch (err) { next(err); }
};

exports.getBuyerFlags = async (req, res, next) => {
  try {
    const buyerId = req.user.id;
    const flags = await Flag.find({ reporter: buyerId, product: { $exists: true } })
      .populate('product')
      .sort({ createdAt: -1 });
    res.json(flags);
  } catch (err) { next(err); }
};

exports.deleteBuyerFlag = async (req, res, next) => {
  try {
    const flagId = req.params.id;
    const buyerId = req.user.id;
    
    const flag = await Flag.findById(flagId);
    if (!flag) return res.status(404).json({ error: 'Flag not found' });
    
    // Only the reporter (buyer) can delete their own flags
    if (flag.reporter.toString() !== buyerId.toString()) {
      return res.status(403).json({ error: 'You can only delete your own flags' });
    }
    
    await Flag.findByIdAndDelete(flagId);
    res.json({ message: 'Flag deleted successfully' });
  } catch (err) { next(err); }
};
