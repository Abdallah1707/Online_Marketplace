const mongoose = require('mongoose');
const config = require('./index');

module.exports = function connectDB() {
  const uri = config.mongoURI;
  mongoose
    .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch((err) => {
      console.error('MongoDB connection error:', err.message);
      process.exit(1);
    });
};
