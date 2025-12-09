// Minimal placeholder AI service for comment summarization
// Replace with a real AI integration (OpenAI, Azure, etc.) as needed.
const Comment = require('../models/Comment');

exports.summarizeCommentsForProduct = async (productId) => {
  const comments = await Comment.find({ product: productId }).limit(50).lean();
  if (!comments || comments.length === 0) return 'No comments to summarize.';
  // Naive summarization: join first 3 comments
  return comments.slice(0, 3).map(c => c.body).join('\n---\n');
};
