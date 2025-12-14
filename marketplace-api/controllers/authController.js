const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, role });
    await user.save();
    res.status(201).json({ id: user._id, email: user.email });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, role: user.role }, config.jwtSecret, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) { next(err); }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) { next(err); }
};

exports.deleteUser = async (req, res, next) => {
 try {
    const userId = req.user.id; // From auth middleware
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Self-delete: ensure the logged-in user is the one being deleted
    if (!user._id.equals(userId)) { // Fixed: use .equals() for ObjectId comparison
      return res.status(403).json({ error: 'Forbidden: Can only delete your own account' });
    }

    // Cascading delete: if seller, delete products and categories
    if (user.role === 'seller') {
      await Product.deleteMany({ seller: userId });
      await Category.deleteMany({ owner: userId });
    }

    await User.findByIdAndDelete(userId);
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    next(err);
  }
};