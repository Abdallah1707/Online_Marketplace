# Backend Setup Instructions

## 1. Install Dependencies
```bash
cd C:\Users\ahmed\Downloads\Online_Marketplace-main\Online_Marketplace-main\marketplace-api
npm install
```

## 2. Create .env File
Create a `.env` file in the marketplace-api folder with:

```env
PORT=4000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

## 3. Start the Backend Server
```bash
npm run dev
```

The server will run on `http://localhost:4000`

## 4. Start the Frontend
In a separate terminal:
```bash
cd C:\Users\ahmed\OneDrive\Desktop\projectwebdevelopment\my-react-site
npm run dev
```

The frontend will run on `http://localhost:5173`

## 5. Test the Connection
- Open the frontend in your browser
- Navigate to the Catalog page
- Check the browser console for API requests
- If products load from the backend, you'll see them
- If the backend is not running, mock data will be used as fallback

## API Endpoints Available
- `GET /api/public/products` - Get all products (no auth)
- `GET /api/public/products/:id` - Get single product
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/buyer/cart` - Get cart (requires auth)
- `POST /api/buyer/cart` - Add to cart (requires auth)
- And more... (see API_DOCUMENTATION.md)

## Troubleshooting
1. **CORS Error**: Already configured in server.js to allow `http://localhost:5173`
2. **Connection Refused**: Make sure backend is running on port 4000
3. **Database Error**: Check your MongoDB connection string in .env
4. **No Products**: Backend will return mock data, or check if DB has products
