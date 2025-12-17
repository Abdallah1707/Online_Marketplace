# Online Marketplace API

A full-featured backend API for an online marketplace, built with Node.js, Express, and MongoDB. Supports user authentication, product management, cart/order handling, ratings, flags, comments, and AI-powered comment summaries.

## Features

- **User Management**: Registration, login, and self-deletion with role-based access (buyer, seller, admin).
- **Product Catalog**: Browse, search, filter products; manage categories.
- **Cart & Orders**: Add to cart, checkout, track orders, update order status.
- **Seller Tools**: Create/update/delete products, manage orders.
- **Buyer Tools**: Rate products, flag sellers, comment on orders.
- **Advanced Features**: AI-generated summaries of product comments (using Google Gemini), flagging system, delivery estimates.
- **Security**: JWT authentication, input validation, ownership checks.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ORM)
- **Authentication**: JWT (jsonwebtoken), bcryptjs for hashing
- **AI Integration**: Google Gemini for comment summarization
- **Other**: dotenv for environment variables, CORS support

## Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB)
- Google AI Studio API key (for AI features)
- npm or yarn

## Installation

1. **Clone the Repository**:
   ```
   git clone <repository-url>
   cd marketplace-api
   ```

2. **Install Dependencies**:
   ```
   npm install
   ```

3. **Environment Setup**:
   - Copy `.env.example` to `.env`:
     ```
     cp .env.example .env
     ```
   - Fill in the `.env` file with your values:
     ```
     MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>
     JWT_SECRET=your_secure_jwt_secret_here
     PORT=4000
     GOOGLE_API_KEY=your_google_ai_api_key_here
     ```

4. **Database**:
   - Ensure MongoDB Atlas is set up and the URI is correct.
   - The app will connect automatically on startup.

## Running the Application

- **Development Mode** (with nodemon for auto-restart):
  ```
  npm run dev
  ```
- **Production Mode**:
  ```
  npm start
  ```

The server will run on `http://localhost:4000` (or the PORT in `.env`).

## API Documentation

Full API documentation is available in `MY_API_DOCUMENTAION.md`, including endpoints, request/response examples, and testing guides.

Key Endpoints:
- **Auth**: `POST /api/auth/register`, `POST /api/auth/login`
- **Products**: `GET /api/public/products`, `POST /api/seller/products`
- **Cart/Orders**: `POST /api/buyer/cart/add`, `POST /api/buyer/orders`
- **AI Summary**: `GET /api/public/products/:id/summary`

## Testing

- Use Postman or curl to test endpoints.
- Refer to the testing guide in `MY_API_DOCUMENTAION.md` for detailed flows.
- Example: Register a user, create a product, add to cart, checkout, and rate the product.

## Project Structure

```
marketplace-api/
├── config/          # Database and app config
├── controllers/     # Route handlers (auth, products, orders, etc.)
├── middleware/      # Auth middleware
├── models/          # Mongoose schemas (User, Product, Order, etc.)
├── routes/          # API routes (auth, buyer, seller, public)
├── services/        # Business logic (AI, cart, order services)
├── .env             # Environment variables
├── server.js        # Main server file
└── README.md        # This file
```

