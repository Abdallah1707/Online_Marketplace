// Minimal placeholder AI service for comment summarization
// Replace with a real AI integration (OpenAI, Azure, etc.) as needed.
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Comment = require('../models/Comment'); // Changed from Rating to Comment

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

exports.summarizeCommentsForProduct = async (productId) => {
  let totalComments = 0;
  let recentComments = [];
  try {
    console.log(`\n=== AI SUMMARY REQUEST ===`);
    console.log(`Product ID: ${productId}`);
    
    const comments = await Comment.find({ product: productId }).populate('author', 'name').lean();
    totalComments = comments.length;
    
    console.log(`Total comments found in DB: ${totalComments}`);
    console.log(`Comments data:`, JSON.stringify(comments, null, 2));
    
    recentComments = comments.slice(-5).map(c => ({
      author: c.author?.name || 'Anonymous',
      body: c.body
    }));

    if (totalComments === 0) {
      console.log(`No comments found, returning default message`);
      return { totalComments: 0, recentComments: [], summary: 'No comments yet for this product.' };
    }

    const commentTexts = comments.map(c => c.body).filter(text => text && text.trim()).join('\n');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `Summarize the following product comments in a concise paragraph:\n\n${commentTexts}`;
    console.log(`Prompt being sent to Gemini (${prompt.length} chars)`);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text().trim() || 'Unable to generate summary';
    
    console.log(`Final Summary:`, summary);
    console.log(`=== END AI SUMMARY ===\n`);

    return { totalComments, recentComments, summary };
  } catch (error) {
    console.error(`=== AI SUMMARY FAILED ===`);
    console.error('Error:', error.message || error);
    console.error(`=== END ERROR ===\n`);
    
    // Fallback mock
    const mockSummary = totalComments > 0 
      ? `This product has ${totalComments} comment(s). Users have mixed feedback.` 
      : 'No comments yet for this product.';
    return { totalComments, recentComments, summary: mockSummary };
  }
};
