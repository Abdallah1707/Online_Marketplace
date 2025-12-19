import { useEffect, useState } from 'react'
import Toast from './Toast'
import { buyerAPI } from '../services/api'
import '../styles/ProductCard.css'

export default function ProductCard({ product }) {
  const [toast, setToast] = useState(null)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [savedComment, setSavedComment] = useState('')
  const [aiSummary, setAiSummary] = useState('')
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [flagged, setFlagged] = useState(false)
  const [loadingFlag, setLoadingFlag] = useState(false)
  
  // Handle both backend (title) and frontend (name) field names
  const productName = product.title || product.name || 'Product'
  const productImage = product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80'
  const categoryName = product.category?.name || product.category || 'General'
  const productId = product._id || product.id

  useEffect(() => {
    // Load persisted rating/comment
    const ratings = JSON.parse(localStorage.getItem('ratings') || '{}')
    const comments = JSON.parse(localStorage.getItem('comments') || '{}')
    const flags = JSON.parse(localStorage.getItem('flaggedProducts') || '{}')
    if (ratings[productId]) setRating(ratings[productId])
    if (comments[productId]) setSavedComment(comments[productId])
    if (flags[productId]) setFlagged(true)
  }, [productId])
  
  const handleAddToCart = () => {
    // Get current cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    
    // Create order item
    const orderItem = {
      id: product._id || product.id,
      name: productName,
      price: product.price,
      qty: 1,
      image: productImage,
      category: categoryName,
      status: 'pending',
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    }
    
    // Check if product already in cart, if so increase qty
    const existingItem = cart.find(item => item.id === orderItem.id)
    if (existingItem) {
      existingItem.qty += 1
    } else {
      cart.push(orderItem)
    }
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart))
    setToast({ message: 'Added to cart!', type: 'success' })
  }

  const handleRate = (value) => {
    const ratings = JSON.parse(localStorage.getItem('ratings') || '{}')
    const updated = { ...ratings, [productId]: value }
    localStorage.setItem('ratings', JSON.stringify(updated))
    setRating(value)
    setToast({ message: `Rated ${value} stars`, type: 'success' })
  }

  const handleSaveComment = () => {
    const comments = JSON.parse(localStorage.getItem('comments') || '{}')
    const updated = { ...comments, [productId]: comment.trim() }
    localStorage.setItem('comments', JSON.stringify(updated))
    setSavedComment(comment.trim())
    setComment('')
    setToast({ message: 'Comment saved', type: 'success' })
  }

  const handleGetAISummary = async () => {
    try {
      setLoadingSummary(true)
      const res = await buyerAPI.getAISummary(productId)
      setAiSummary(res.summary || 'No summary available yet.')
      setToast({ message: 'AI summary ready', type: 'success' })
    } catch (e) {
      setToast({ message: 'Failed to load AI summary', type: 'error' })
    } finally {
      setLoadingSummary(false)
    }
  }

  const handleFlagSeller = async () => {
    if (flagged) return
    setLoadingFlag(true)
    try {
      // Attempt backend flag if authenticated; ignore failures
      try {
        await buyerAPI.flagProduct(productId, 'Flagged by buyer from catalog')
      } catch (_) { /* noop - local persist still applies */ }

      const flags = JSON.parse(localStorage.getItem('flaggedProducts') || '{}')
      flags[productId] = true
      localStorage.setItem('flaggedProducts', JSON.stringify(flags))
      setFlagged(true)
      setToast({ message: 'Seller flagged for review', type: 'success' })
    } finally {
      setLoadingFlag(false)
    }
  }
  
  return (
    <article className="product-card">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="product-image-wrap">
        <img src={productImage} alt={productName} loading="lazy" />
        {product.badge && <span className={`product-badge ${product.badgeType || 'new'}`}>{product.badge}</span>}
      </div>

      <div className="product-info">
        <div className="product-meta">
          <p className="category">{categoryName}</p>
        </div>

        <h3 className="product-name">{productName}</h3>

        <div className="product-rating">
          <div className="stars" role="radiogroup" aria-label="Product rating">
            {[...Array(5)].map((_, i) => {
              const idx = i + 1
              const isFilled = idx <= (hoverRating || rating || Math.floor(product.rating || 0))
              return (
                <button
                  key={idx}
                  type="button"
                  role="radio"
                  aria-checked={rating === idx}
                  onMouseEnter={() => setHoverRating(idx)}
                  onMouseLeave={() => setHoverRating(0)}
                  onFocus={() => setHoverRating(idx)}
                  onBlur={() => setHoverRating(0)}
                  onClick={() => handleRate(idx)}
                  className={`star ${isFilled ? 'filled' : ''}`}
                  aria-label={`Rate ${idx} star${idx > 1 ? 's' : ''}`}
                  title={`Rate ${idx} star${idx > 1 ? 's' : ''}`}
                >
                  ★
                </button>
              )
            })}
          </div>
          <span className="rating-chip">{rating ? `You rated ${rating}` : `${Math.floor(product.rating || 0)}/5`}</span>
        </div>

        <div className="product-footer">
          <div className="price-section">
            <span className="price">${product.price}</span>
            {product.originalPrice && (
              <span className="original-price">${product.originalPrice}</span>
            )}
          </div>
        </div>

        <button className="add-to-cart" type="button" onClick={handleAddToCart}>
          Add to Cart
        </button>
      </div>

      {/* Comments, AI Summary & Flag */}
      <div style={{ padding: '10px 12px' }}>
        {savedComment ? (
          <div style={{ background: '#f3f4f6', padding: '8px', borderRadius: '6px', marginBottom: '8px' }}>
            <strong style={{ fontSize: '12px' }}>Your comment:</strong>
            <p style={{ margin: 0, fontSize: '13px' }}>{savedComment}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '8px' }}>
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              style={{ flex: 1, padding: '6px 8px', fontSize: '12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
            />
            <button type="button" onClick={handleSaveComment} style={{ padding: '6px 10px', fontSize: '12px', background: '#3b82f6', color: '#fff', border: 0, borderRadius: '6px' }}>Save</button>
          </div>
        )}

        {aiSummary ? (
          <div style={{ background: '#f0f9ff', padding: '8px', borderRadius: '6px', borderLeft: '3px solid #0ea5e9' }}>
            <strong style={{ fontSize: '12px', color: '#0369a1' }}>🤖 AI Summary:</strong>
            <p style={{ margin: 0, fontSize: '13px', color: '#0c4a6e' }}>{aiSummary}</p>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleGetAISummary}
            disabled={loadingSummary}
            style={{ background: 'none', border: 'none', color: '#0ea5e9', fontSize: '13px', cursor: loadingSummary ? 'not-allowed' : 'pointer' }}
          >
            {loadingSummary ? '⏳ Loading summary...' : '🤖 View AI Summary'}
          </button>
        )}

        <div className="product-actions">
          <button
            type="button"
            className={`flag-btn ${flagged ? 'flagged' : ''}`}
            onClick={handleFlagSeller}
            disabled={flagged || loadingFlag}
            title={flagged ? 'Already flagged' : 'Flag seller'}
          >
            {flagged ? '✅ Flagged' : '🚩 Flag seller'}
          </button>
        </div>
      </div>
    </article>
  )
}
