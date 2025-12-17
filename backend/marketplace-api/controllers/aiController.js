const aiService = require('../services/aiService');

exports.summarizeComments = async (req, res, next) => {
  try {
    const { id } = req.params; // was productId — use :id to match routes/docs
    const summary = await aiService.summarizeCommentsForProduct(id);
    res.json({ summary });
  } catch (err) { next(err); }
};
