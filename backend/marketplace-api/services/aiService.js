// AI service for comment summarization using Google Gemini API
const Comment = require('../models/Comment');

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

    // Include author names in the concatenated text
    const commentTexts = comments.map(c => `${c.author?.name || 'Anonymous'}: ${c.body}`).join('\n');
    console.log(`Concatenated comment text (${commentTexts.length} chars):`, commentTexts.substring(0, 200) + '...');
    
    const prompt = `Summarize the following product comments in a concise paragraph:\n\n${commentTexts}`;
    console.log(`Prompt being sent to Gemini (${prompt.length} chars)`);
    
    // Direct REST API call to Google Gemini using v1 API
    const apiKey = process.env.GOOGLE_API_KEY;
    const modelName = 'gemini-1.5-flash'; // This is the correct model name for v1 API
    const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`;
    
    console.log(`Calling Gemini API with model: ${modelName}`);
    
    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log(`Gemini API Response Status: ${response.status}`);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.log(`Gemini API Error Response:`, errorData);
      throw new Error(`Gemini API Error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log(`Gemini API Success Response:`, JSON.stringify(data, null, 2));
    
    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'Unable to generate summary';
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
