# Online Marketplace - Complete API Documentation

**Last Updated:** December 9, 2025  
**Project:** Online Marketplace (Full-Stack E-Commerce)  
**Status:** Phase 1 Complete, Phases 2-4 Planned

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Authentication & Core](#authentication--core)
3. [Phase 1 - Public Catalog (✅ COMPLETE)](#phase-1---public-catalog--complete)

---

## Project Overview

### Tech Stack
- **Backend:** Node.js + Express.js
- **Database:** MongoDB (Atlas Cloud)
- **Authentication:** JWT (JSON Web Tokens) + bcryptjs
- **ORM:** Mongoose

### API Base URL
```
http://localhost:4000/api
```

### Standard Response Format

**Success (200-201):**
```json
{
  "id": "...",
  "name": "...",
  "data": {...}
}
```

**Error (4xx-5xx):**
```json
{
  "error": "Error message here"
}
```

### Authentication Header
All protected endpoints require:
```
Authorization: Bearer <jwt_token>
```

---

## Authentication & Core

### 1. User Registration
**Endpoint:** `POST /api/auth/register`  
**Auth Required:** ❌ No  
**Role Required:** None

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "buyer"
}
```

**Response (201):**
```json
{
  "id": "65abc123...",
  "email": "john@example.com"
}
```

**Validations:**
- ✓ Email must be unique
- ✓ Password will be hashed with bcryptjs (10 rounds)
- ✓ Role must be: `buyer`, `seller`, or `admin` (defaults to `buyer`)

---

### 2. User Login
**Endpoint:** `POST /api/auth/login`  
**Auth Required:** ❌ No  
**Role Required:** None

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Token Details:**
- Valid for 7 days
- Encoded data: `{ id, role }`
- Sign algorithm: HS256
- Secret: `JWT_SECRET` from `.env`

**Error Cases:**
```json
{
  "error": "Invalid credentials"
}
```

---

### 3. Get All Users
**Endpoint:** `GET /api/auth/users`  
**Auth Required:** ❌ No  
**Role Required:** None

**Response (200):**
```json
[
  {
    "_id": "65abc123...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "buyer",
    "createdAt": "2025-12-09T10:00:00Z"
  }
]
```

**Note:** Passwords are excluded from response

---

### 4. Health Check
**Endpoint:** `GET /health`  
**Auth Required:** ❌ No  
**Role Required:** None

**Response (200):**
```json
{
  "ok": true
}
```

---

## Phase 1 - Public Catalog (✅ COMPLETE)

Public endpoints for browsing products and categories. **No authentication required.**

### 1. List All Products
**Endpoint:** `GET /api/public/products`  
**Auth Required:** ❌ No  

**Query Parameters:**
| Param | Type | Description | Example |
|-------|------|-------------|---------|
| `category` | string | Filter by category ID | `?category=65abc123...` |
| `minPrice` | number | Minimum price filter | `?minPrice=10` |
| `maxPrice` | number | Maximum price filter | `?maxPrice=500` |
| `sort` | string | Sort order (`newest`, `price-asc`, `price-desc`) | `?sort=price-asc` |

**Response (200):**
```json
[
  {
    "_id": "65product1...",
    "title": "iPhone 15 Pro",
    "description": "Latest Apple smartphone",
    "price": 999,
    "seller": {
      "_id": "65seller1...",
      "name": "Tech Store",
      "email": "store@example.com"
    },
    "category": {
      "_id": "65cat1...",
      "name": "Electronics"
    },
    "createdAt": "2025-12-09T10:00:00Z"
  }
]
```

**Example Requests:**
```
GET /api/public/products
GET /api/public/products?category=65abc123
GET /api/public/products?minPrice=100&maxPrice=500
GET /api/public/products?sort=price-asc
GET /api/public/products?category=65abc123&sort=newest
```

---

### 2. Get Product Details with Comments
**Endpoint:** `GET /api/public/products/:id`  
**Auth Required:** ❌ No  
**URL Parameters:**
- `id` - Product ID (MongoDB ObjectId)

**Response (200):**
```json
{
  "_id": "65product1...",
  "title": "iPhone 15 Pro",
  "description": "Latest Apple smartphone with A17 Pro chip",
  "price": 999,
  "seller": {
    "_id": "65seller1...",
    "name": "Tech Store",
    "email": "store@example.com"
  },
  "category": {
    "_id": "65cat1...",
    "name": "Electronics",
    "description": "All electronic items"
  },
  "flags": [],
  "createdAt": "2025-12-09T10:00:00Z",
  "comments": [
    {
      "_id": "65comment1...",
      "body": "Great product! Arrived quickly.",
      "author": {
        "_id": "65user1...",
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "createdAt": "2025-12-08T15:30:00Z"
    },
    {
      "_id": "65comment2...",
      "body": "Excellent quality and fast shipping!",
      "author": {
        "_id": "65user2...",
        "name": "Mike Johnson",
        "email": "mike@example.com"
      },
      "createdAt": "2025-12-07T12:00:00Z"
    }
  ]
}
```

**Error Cases:**
```json
{
  "error": "Product not found"
}
```

---

### 3. Get Product Comment Summary (AI Feature)
**Endpoint:** `GET /api/public/products/:id/summary`  
**Auth Required:** ❌ No  
**URL Parameters:**
- `id` - Product ID

**Response (200) - With Comments:**
```json
{
  "totalComments": 5,
  "recentComments": [
    "Great product! Arrived quickly.",
    "Excellent quality and fast shipping!",
    "Would recommend to anyone"
  ],
  "summary": "This product has 5 comments. Great product! Arrived quickly."
}
```

**Response (200) - No Comments:**
```json
{
  "summary": "No comments yet for this product."
}
```

---

### 4. Search Products
**Endpoint:** `GET /api/public/search`  
**Auth Required:** ❌ No  

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `q` | string | Yes | Search query (searches title & description) |

**Response (200):**
```json
[
  {
    "_id": "65product1...",
    "title": "iPhone 15 Pro Max",
    "description": "Largest iPhone yet with advanced camera",
    "price": 1099,
    "seller": {
      "_id": "65seller1...",
      "name": "Tech Store",
      "email": "store@example.com"
    },
    "category": {
      "_id": "65cat1...",
      "name": "Electronics"
    },
    "createdAt": "2025-12-09T10:00:00Z"
  }
]
```

**Search Behavior:**
- Case-insensitive regex search
- Searches in product title and description
- Returns up to 50 results
- Empty query returns empty array

**Example Requests:**
```
GET /api/public/search?q=iphone
GET /api/public/search?q=laptop
GET /api/public/search?q=samsung
```

---

### 5. List All Categories
**Endpoint:** `GET /api/public/categories`  
**Auth Required:** ❌ No  

**Response (200):**
```json
[
  {
    "_id": "65cat1...",
    "name": "Electronics",
    "description": "All electronic devices and gadgets",
    "createdAt": "2025-12-01T08:00:00Z"
  },
  {
    "_id": "65cat2...",
    "name": "Clothing",
    "description": "Apparel and fashion items",
    "createdAt": "2025-12-01T08:05:00Z"
  },
  {
    "_id": "65cat3...",
    "name": "Books",
    "description": "All types of books and publications",
    "createdAt": "2025-12-01T08:10:00Z"
  }
]
```

---

### 6. Get Category with Products
**Endpoint:** `GET /api/public/categories/:id`  
**Auth Required:** ❌ No  
**URL Parameters:**
- `id` - Category ID

**Response (200):**
```json
{
  "_id": "65cat1...",
  "name": "Electronics",
  "description": "All electronic devices and gadgets",
  "createdAt": "2025-12-01T08:00:00Z",
  "products": [
    {
      "_id": "65product1...",
      "title": "iPhone 15 Pro",
      "description": "Latest Apple smartphone",
      "price": 999,
      "seller": {
        "_id": "65seller1...",
        "name": "Tech Store",
        "email": "store@example.com"
      },
      "createdAt": "2025-12-09T10:00:00Z"
    }
  ]
}
```

**Error Cases:**
```json
{
  "error": "Category not found"
}
```