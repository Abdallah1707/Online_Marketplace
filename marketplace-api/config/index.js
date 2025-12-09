const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

module.exports = {
  port: process.env.PORT || 4000,
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/marketplace',
  jwtSecret: process.env.JWT_SECRET || 'change-me',
  nodeEnv: process.env.NODE_ENV || 'development'
};
