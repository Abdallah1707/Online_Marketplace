const Product = require('../models/Product');
const Category = require('../models/Category');
const Comment = require('../models/Comment');

// ============ PUBLIC ENDPOINTS ============

// GET /api/public/products - List all products with filters
exports.list = async (req, res, next) => {
  try {
    const { category, minPrice, maxPrice, sort } = req.query;
    let filter = {};
    
    // Filter by category
    if (category) filter.category = category;
    
    // Filter by price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    
    // Build query
    let query = Product.find(filter).populate('category', 'name').populate('seller', 'name email');
    
    // Apply sorting
    if (sort === 'newest') query = query.sort({ createdAt: -1 });
    else if (sort === 'price-asc') query = query.sort({ price: 1 });
    else if (sort === 'price-desc') query = query.sort({ price: -1 });
    
    const products = await query.limit(50);
    res.json(products);
  } catch (err) { next(err); }
};

// GET /api/public/products/:id - Get product details with comments
exports.get = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name description')
      .populate('seller', 'name email');
    
    if (!product) return res.status(404).json({ error: 'Product not found' });
    
    // Get comments for this product
    const comments = await Comment.find({ product: req.params.id })
      .populate('author', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({
      ...product.toObject(),
      comments
    });
  } catch (err) { next(err); }
};

// GET /api/public/products/:id/summary - Get AI-generated comment summary
exports.getCommentSummary = async (req, res, next) => {
  try {
    const comments = await Comment.find({ product: req.params.id })
      .populate('author', 'name')
      .sort({ createdAt: -1 });
    
    if (comments.length === 0) {
      return res.json({ summary: 'No comments yet for this product.' });
    }
    
    // Simple summarization: Group comments and get stats
    const commentTexts = comments.map(c => c.body);
    const summary = {
      totalComments: comments.length,
      recentComments: commentTexts.slice(0, 3),
      summary: `This product has ${comments.length} comments. ${commentTexts.slice(0, 1).join(' ')}`
    };
    
    res.json(summary);
  } catch (err) { next(err); }
};

// GET /api/public/products/search?q=... - Search products
exports.search = async (req, res, next) => {
  try {
    const q = req.query.q || '';
    
    if (!q.trim()) {
      return res.json([]);
    }
    
    // Search in title and description using regex (case-insensitive)
    const products = await Product.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ]
    })
    .populate('category', 'name')
    .populate('seller', 'name')
    .limit(50);
    
    res.json(products);
  } catch (err) { next(err); }
};

// GET /api/public/categories - List all categories
exports.listCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) { next(err); }
};

// GET /api/public/categories/:id - Get category with products
exports.getCategoryWithProducts = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) return res.status(404).json({ error: 'Category not found' });
    
    const products = await Product.find({ category: req.params.id })
      .populate('seller', 'name')
      .limit(50);
    
    res.json({
      ...category.toObject(),
      products
    });
  } catch (err) { next(err); }
};

// ============ SELLER ENDPOINTS ============

// POST /api/seller/products - Create new product (seller only)
exports.create = async (req, res, next) => {
  try {
    const { title, description, price, category } = req.body;
    
    if (!title || !price) {
      return res.status(400).json({ error: 'Title and price are required' });
    }
    
    const product = new Product({
      title,
      description,
      price,
      category,
      seller: req.user.id
    });
    
    await product.save();
    await product.populate('category', 'name');
    await product.populate('seller', 'name');
    
    res.status(201).json(product);
  } catch (err) { next(err); }
};

// PUT /api/seller/products/:id - Update product (seller only)
exports.update = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) return res.status(404).json({ error: 'Product not found' });
    
    // Verify seller owns this product
    if (product.seller.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    const { title, description, price, category } = req.body;
    if (title) product.title = title;
    if (description) product.description = description;
    if (price) product.price = price;
    if (category) product.category = category;
    
    await product.save();
    await product.populate('category', 'name');
    await product.populate('seller', 'name');
    
    res.json(product);
  } catch (err) { next(err); }
};

// DELETE /api/seller/products/:id - Delete product (seller only)
exports.delete = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) return res.status(404).json({ error: 'Product not found' });
    
    // Verify seller owns this product
    if (product.seller.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    await Product.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Product deleted' });
  } catch (err) { next(err); }
};

// GET /api/seller/products - Get all products for logged-in seller
exports.sellerProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ seller: req.user.id })
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    
    res.json(products);
  } catch (err) { next(err); }
};
