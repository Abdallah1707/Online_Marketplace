# Vercel Deployment Guide - Step by Step

## Prerequisites
- GitHub account with your code pushed
- Backend already deployed on Render (get the backend URL first)

---

## Part 1: Deploy Buyer App

### Step 1: Go to Vercel
1. Open your browser and go to: **https://vercel.com**
2. Click **"Sign Up"** (or **"Log In"** if you have an account)
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub repositories

### Step 2: Create New Project for Buyer App
1. Once logged in, you'll see the Vercel dashboard
2. Click the **"Add New..."** button (top right)
3. Select **"Project"** from the dropdown

### Step 3: Import Your Repository
1. You'll see "Import Git Repository"
2. Find your **"Online_Marketplace"** repository in the list
3. Click **"Import"** next to it
4. *If you don't see it:* Click **"Adjust GitHub App Permissions"** and give Vercel access to that repo

### Step 4: Configure Buyer App Settings
You'll see a configuration screen. Fill it out EXACTLY like this:

**Project Settings:**
- **Project Name:** `marketplace-buyer` (or any name you want)
- **Framework Preset:** Select **"Vite"** from dropdown
- **Root Directory:** Click **"Edit"** → Type: `buyer-app` → Click **"Continue"**

**Build Settings:**
- **Build Command:** `npm run build` (should be auto-filled)
- **Output Directory:** `dist` (should be auto-filled)
- **Install Command:** `npm install` (should be auto-filled)

### Step 5: Add Environment Variable
1. Scroll down to **"Environment Variables"** section
2. Click to expand it
3. Add ONE variable:
   - **Key (Name):** `VITE_API_BASE_URL`
   - **Value:** Your Render backend URL + `/api`
   - Example: `https://marketplace-backend-abc.onrender.com/api`
   - **Important:** Replace with YOUR actual Render URL (no trailing slash after /api)

4. Leave **"Environment"** as "Production" (default)

### Step 6: Deploy
1. Click the **"Deploy"** button at the bottom
2. Wait 2-5 minutes while Vercel builds and deploys
3. You'll see a progress screen with logs
4. When done, you'll see "Congratulations! 🎉"

### Step 7: Get Your Buyer App URL
1. After deployment completes, you'll see your live URL at the top
2. It will look like: `https://marketplace-buyer.vercel.app` or `https://marketplace-buyer-abc123.vercel.app`
3. **COPY THIS URL** - you'll need it for backend CORS settings
4. Click the URL to test - you should see your buyer app homepage!

---

## Part 2: Deploy Seller App

### Step 1: Create Second Project
1. Go back to Vercel dashboard (click "Vercel" logo top left)
2. Click **"Add New..."** → **"Project"** again
3. Find your **"Online_Marketplace"** repository again
4. Click **"Import"**

### Step 2: Configure Seller App Settings
**THIS TIME, use different settings for seller app:**

**Project Settings:**
- **Project Name:** `marketplace-seller` (different from buyer!)
- **Framework Preset:** Select **"Vite"**
- **Root Directory:** Click **"Edit"** → Type: `seller-app` → Click **"Continue"** (NOT buyer-app!)

**Build Settings:**
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### Step 3: Add Environment Variable
1. Scroll to **"Environment Variables"**
2. Add ONE variable:
   - **Key:** `VITE_API_BASE_URL`
   - **Value:** Same Render backend URL + `/api`
   - Example: `https://marketplace-backend-abc.onrender.com/api`

### Step 4: Deploy
1. Click **"Deploy"**
2. Wait 2-5 minutes
3. Get "Congratulations! 🎉"

### Step 5: Get Your Seller App URL
1. Copy the seller app URL from the top
2. It will look like: `https://marketplace-seller.vercel.app` or similar
3. **SAVE THIS URL** too!

---

## Part 3: Update Backend CORS Settings

Now that you have both frontend URLs, update your backend on Render:

### Step 1: Go to Render Dashboard
1. Go to: **https://dashboard.render.com**
2. Click on your backend service (e.g., "marketplace-backend")

### Step 2: Update Environment Variables
1. Click **"Environment"** in the left sidebar
2. Find `BUYER_APP_URL` variable
3. Click the edit icon (pencil)
4. Replace the value with your ACTUAL buyer URL from Vercel
   - Example: `https://marketplace-buyer-abc123.vercel.app`
   - **NO trailing slash!**

5. Find `SELLER_APP_URL` variable
6. Click the edit icon
7. Replace with your ACTUAL seller URL from Vercel
   - Example: `https://marketplace-seller-xyz789.vercel.app`
   - **NO trailing slash!**

8. Click **"Save Changes"**
9. Your backend will automatically redeploy (takes 2-3 minutes)

---

## Part 4: Test Your Deployment

### Test Buyer App
1. Visit your buyer URL: `https://marketplace-buyer-abc123.vercel.app`
2. You should see the Sellora homepage
3. Click **"Products"** - should load products from backend
4. Try creating an account (Sign Up)
5. Try logging in
6. Add products to cart

### Test Seller App
1. Visit your seller URL: `https://marketplace-seller-xyz789.vercel.app`
2. You should see the seller login page
3. Login with test credentials:
   - Email: `seller1@test.com`
   - Password: `password123`
4. Check your products
5. Check orders
6. Try creating a new product

---

## Common Issues & Fixes

### Issue: "Failed to fetch" or Network Error
**Fix:**
- Make sure backend is running (visit backend-url/health)
- Check VITE_API_BASE_URL is correct in Vercel
- Ensure backend CORS has correct frontend URLs
- Wait for backend redeploy to finish after updating CORS

### Issue: Blank Page After Deployment
**Fix:**
- Check browser console (F12) for errors
- Ensure Root Directory is set correctly (buyer-app or seller-app)
- Make sure Framework Preset is "Vite"
- Try redeploying: Go to Deployments → Click "..." → Redeploy

### Issue: App Loads But No Data
**Fix:**
- Backend might not be seeded - run seed.js with Atlas connection
- Check Network tab in browser (F12) - see if API calls are going to correct URL
- Verify VITE_API_BASE_URL has /api at the end

### Issue: CORS Error in Console
**Fix:**
- Check backend CORS URLs don't have trailing slashes
- Make sure you saved changes on Render
- Wait for backend to redeploy (check Render logs)
- Frontend URLs must match EXACTLY (including https://)

---

## Managing Deployments

### Redeploy After Code Changes
Vercel automatically redeploys when you push to GitHub:
1. Make changes to your code locally
2. Commit: `git add . && git commit -m "your message"`
3. Push: `git push origin deployment-features`
4. Vercel detects the push and redeploys automatically!

### Manual Redeploy
If you need to redeploy without code changes:
1. Go to Vercel dashboard
2. Click your project
3. Go to **"Deployments"** tab
4. Find latest deployment
5. Click **"..."** → **"Redeploy"**

### Update Environment Variables
If you need to change VITE_API_BASE_URL:
1. Go to Vercel project
2. Click **"Settings"**
3. Click **"Environment Variables"** in sidebar
4. Edit the variable
5. Go to **"Deployments"** → Redeploy

---

## Quick Reference

### Buyer App Configuration
```
Project Name: marketplace-buyer
Framework: Vite
Root Directory: buyer-app
Build Command: npm run build
Output Directory: dist
Environment Variable: VITE_API_BASE_URL = https://your-backend.onrender.com/api
```

### Seller App Configuration
```
Project Name: marketplace-seller
Framework: Vite
Root Directory: seller-app
Build Command: npm run build
Output Directory: dist
Environment Variable: VITE_API_BASE_URL = https://your-backend.onrender.com/api
```

### Backend CORS Update
```
BUYER_APP_URL = https://marketplace-buyer-abc123.vercel.app
SELLER_APP_URL = https://marketplace-seller-xyz789.vercel.app
```

---

## Your Live URLs Checklist

After deployment, you should have:
- ✅ **Backend:** `https://[your-name].onrender.com`
- ✅ **Buyer App:** `https://[your-name].vercel.app`
- ✅ **Seller App:** `https://[your-name].vercel.app`

Save these URLs - you'll need them for documentation!
