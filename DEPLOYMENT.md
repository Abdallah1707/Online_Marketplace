# Deployment Guide

## Overview
This marketplace application consists of three deployable components:
1. **Buyer Frontend** - Vite React app
2. **Seller Frontend** - Vite React app
3. **Backend API** - Node.js/Express server
4. **Database** - MongoDB Atlas

---

## Prerequisites

### 1. MongoDB Atlas Setup
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user (username + password)
4. Whitelist IP addresses (use `0.0.0.0/0` for all IPs in development)
5. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/onlinemarketplace`

### 2. Seed the Database
Before deploying, run the seed script locally connected to Atlas:
```bash
cd backend/marketplace-api
# Update MONGO_URI in .env to point to Atlas
node seed.js
```

---

## Backend Deployment (Render)

### Step 1: Push to GitHub
Ensure your code is pushed to GitHub:
```bash
git add .
git commit -m "Prepare for deployment"
git push origin deployment-features
```

### Step 2: Deploy on Render
1. Go to [Render.com](https://render.com) and sign in with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect your `Online_Marketplace` repository
4. Configure:
   - **Name:** `marketplace-backend` (or your choice)
   - **Root Directory:** `backend/marketplace-api`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** Free

5. **Add Environment Variables:**
   ```
   PORT=4000
   NODE_ENV=production
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/onlinemarketplace
   JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
   BUYER_APP_URL=https://your-buyer-app.vercel.app
   SELLER_APP_URL=https://your-seller-app.vercel.app
   ```

6. Click **"Create Web Service"**
7. Wait for deployment (5-10 minutes)
8. Copy your backend URL: `https://marketplace-backend.onrender.com`

---

## Frontend Deployment (Vercel)

### Buyer App Deployment

1. Go to [Vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New"** → **"Project"**
3. Import your `Online_Marketplace` repository
4. Configure **Buyer App**:
   - **Project Name:** `marketplace-buyer` (or your choice)
   - **Framework Preset:** Vite
   - **Root Directory:** `buyer-app`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

5. **Add Environment Variable:**
   ```
   VITE_API_BASE_URL=https://marketplace-backend.onrender.com/api
   ```

6. Click **"Deploy"**
7. Copy your buyer URL: `https://marketplace-buyer.vercel.app`

### Seller App Deployment

1. In Vercel, click **"Add New"** → **"Project"** again
2. Import the same repository
3. Configure **Seller App**:
   - **Project Name:** `marketplace-seller`
   - **Framework Preset:** Vite
   - **Root Directory:** `seller-app`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. **Add Environment Variable:**
   ```
   VITE_API_BASE_URL=https://marketplace-backend.onrender.com/api
   ```

5. Click **"Deploy"**
6. Copy your seller URL: `https://marketplace-seller.vercel.app`

---

## Update Backend CORS

After deploying frontends, update backend environment variables on Render:

1. Go to your Render dashboard → `marketplace-backend`
2. Go to **Environment** tab
3. Update:
   ```
   BUYER_APP_URL=https://marketplace-buyer.vercel.app
   SELLER_APP_URL=https://marketplace-seller.vercel.app
   ```
4. Save changes (will trigger auto-redeploy)

---

## Local Development

### Backend
```bash
cd backend/marketplace-api
cp .env.example .env
# Edit .env with your local MongoDB and secrets
npm install
npm run dev
```

### Buyer App
```bash
cd buyer-app
cp .env.example .env.local
# Edit .env.local to point to local backend: http://localhost:4000/api
npm install
npm run dev
```

### Seller App
```bash
cd seller-app
cp .env.example .env.local
# Edit .env.local to point to local backend: http://localhost:4000/api
npm install
npm run dev
```

---

## Environment Variables Summary

### Backend (.env)
- `PORT` - Server port (default: 4000)
- `NODE_ENV` - Environment (development/production)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens (minimum 32 characters)
- `BUYER_APP_URL` - Deployed buyer frontend URL
- `SELLER_APP_URL` - Deployed seller frontend URL

### Frontend (.env.local for local, Environment Variables in Vercel)
- `VITE_API_BASE_URL` - Backend API URL

---

## Testing Deployment

### Test Backend
Visit: `https://marketplace-backend.onrender.com/health`  
Should return: `{"ok":true}`

### Test Buyer App
1. Visit: `https://marketplace-buyer.vercel.app`
2. Click "Products" - should load products from backend
3. Try signup/login

### Test Seller App
1. Visit: `https://marketplace-seller.vercel.app`
2. Try login with: `seller1@test.com` / `password123`
3. Check orders and products

---

## Troubleshooting

### CORS Errors
- Ensure `BUYER_APP_URL` and `SELLER_APP_URL` are set correctly in backend
- Check that URLs don't have trailing slashes
- Redeploy backend after changing environment variables

### Backend Won't Start
- Check Render logs for errors
- Verify MongoDB connection string is correct
- Ensure all required environment variables are set

### Frontend API Calls Failing
- Check browser console for errors
- Verify `VITE_API_BASE_URL` is set correctly
- Ensure backend is running (check /health endpoint)

### Database Connection Failed
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check database user permissions
- Ensure connection string password is URL-encoded

---

## Live URLs

After deployment, your live URLs will be:
- **Buyer App:** `https://marketplace-buyer.vercel.app`
- **Seller App:** `https://marketplace-seller.vercel.app`
- **Backend API:** `https://marketplace-backend.onrender.com`

---

## Screenshots for Documentation

Take screenshots of:
1. Render environment variables (hide `JWT_SECRET`, `MONGO_URI` values)
2. Vercel environment variables for both apps
3. MongoDB Atlas connection success
4. Live buyer app homepage
5. Live seller app dashboard
