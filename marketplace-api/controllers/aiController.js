const aiService = require('../services/aiService');

exports.summarizeComments = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const summary = await aiService.summarizeCommentsForProduct(productId);
    res.json({ summary });
  } catch (err) { next(err); }
};
