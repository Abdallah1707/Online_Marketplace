const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/authMiddleware');
const orderController = require('../controllers/orderController');

router.use(protect);
router.post('/orders', orderController.createOrder);
router.get('/orders/:id', orderController.getOrder);

module.exports = router;
