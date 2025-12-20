const Comment = require('../models/Comment');
const Product = require('../models/Product');

exports.addProductComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { body } = req.body;
    const userId = req.user.id;

    console.log(`\n=== BACKEND COMMENT RECEIVED ===`);
    console.log(`Product ID: ${id}`);
    console.log(`User ID: ${userId}`);
    console.log(`Comment body: "${body}"`);
    console.log(`Comment body type: ${typeof body}`);
    console.log(`Comment body length: ${body?.length || 0}`);

    // Verify product exists
    const product = await Product.findById(id);
    if (!product) {
      console.log(`Product not found with ID: ${id}`);
      return res.status(404).json({ error: 'Product not found' });
    }

    // Create comment
    const newComment = new Comment({ 
      author: userId, 
      product: id, 
      body 
    });
    
    console.log(`Saving comment to DB...`);
    await newComment.save();
    console.log(`Comment saved with ID: ${newComment._id}`);
    console.log(`Comment author ID before populate: ${newComment.author}`);
    
    // Populate author with name field
    await newComment.populate({
      path: 'author',
      select: 'name email'
    });
    console.log(`Comment populated with author:`, newComment.author);
    console.log(`Author name: ${newComment.author?.name}`);
    console.log(`=== COMMENT SAVED SUCCESSFULLY ===\n`);
    
    // Send populated comment to frontend
    const responseData = {
      _id: newComment._id,
      body: newComment.body,
      author: {
        _id: newComment.author?._id,
        name: newComment.author?.name || 'Anonymous',
        email: newComment.author?.email
      },
      product: newComment.product,
      createdAt: newComment.createdAt
    };
    
    console.log(`Sending response to frontend:`, JSON.stringify(responseData, null, 2));
    res.status(201).json(responseData);
  } catch (err) { 
    console.error(`=== COMMENT SAVE ERROR ===`);
    console.error(err);
    console.log(`=== END ERROR ===\n`);
    next(err); 
  }
};

exports.getProductComments = async (req, res, next) => {
  try {
    const { id } = req.params;

    console.log(`\n=== FETCHING COMMENTS FOR PRODUCT ===`);
    console.log(`Product ID: ${id}`);

    // Verify product exists
    const product = await Product.findById(id);
    if (!product) {
      console.log(`Product not found with ID: ${id}`);
      return res.status(404).json({ error: 'Product not found' });
    }

    // Fetch all comments for the product and populate author info
    const comments = await Comment.find({ product: id })
      .populate({
        path: 'author',
        select: 'name email'
      })
      .sort({ createdAt: -1 })
      .lean();

    console.log(`Total comments found: ${comments.length}`);
    console.log(`Comments:`, JSON.stringify(comments, null, 2));

    // Transform comments to include author name
    const formattedComments = comments.map(comment => ({
      _id: comment._id,
      body: comment.body,
      text: comment.body,
      author: {
        _id: comment.author?._id,
        name: comment.author?.name || 'Anonymous',
        email: comment.author?.email
      },
      createdAt: comment.createdAt
    }));

    console.log(`=== COMMENTS FETCHED SUCCESSFULLY ===\n`);
    res.json(formattedComments);
  } catch (err) {
    console.error(`=== FETCH COMMENTS ERROR ===`);
    console.error(err);
    console.log(`=== END ERROR ===\n`);
    next(err);
  }
};