const { GoogleGenerativeAI } = require('@google/generative-ai');
const Rating = require('../models/Rating'); // Changed from Comment to Rating

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

exports.summarizeCommentsForProduct = async (productId) => {
  let totalComments = 0;
  let recentComments = [];
  try {
    const ratings = await Rating.find({ product: productId }).select('comment').lean();
    totalComments = ratings.length;
    recentComments = ratings.slice(-5).map(r => r.comment);

    if (totalComments === 0) {
      return { totalComments: 0, recentComments: [], summary: 'No comments yet for this product.' };
    }

    const commentTexts = ratings.map(r => r.comment).join('\n');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `Summarize the following product comments in a concise paragraph:\n\n${commentTexts}`;
    const result = await model.generateContent(prompt);
    const summary = result.response.text().trim();

    return { totalComments, recentComments, summary };
  } catch (error) {
    console.error('AI Summary Error:', error);
    // Fallback mock
    const mockSummary = totalComments > 0 
      ? `Mock summary: This product has ${totalComments} comment(s). Users have mixed feedback.` 
      : 'No comments yet for this product.';
    return { totalComments, recentComments, summary: mockSummary };
  }
};
