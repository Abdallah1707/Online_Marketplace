const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Not authorized' });
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ error: 'Not authorized' });
    req.user = { id: user._id, role: user.role };
    next();
  } catch (err) { next(err); }
};

exports.requireRole = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role) return res.status(403).json({ error: 'Forbidden' });
  next();
};
