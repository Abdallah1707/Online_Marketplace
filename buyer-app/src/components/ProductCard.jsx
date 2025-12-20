import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Toast from './Toast'
import { buyerAPI, publicAPI } from '../services/api'
import '../styles/ProductCard.css'

export default function ProductCard({ product }) {
  const [toast, setToast] = useState(null)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [savedComments, setSavedComments] = useState([])
  const [aiSummary, setAiSummary] = useState('')
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [flagged, setFlagged] = useState(false)
  const [flagResolved, setFlagResolved] = useState(false)
  const [loadingFlag, setLoadingFlag] = useState(false)
  
  // Handle both backend (title) and frontend (name) field names
  const productName = product.title || product.name || 'Product'
  const productImage = product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80'
  const categoryName = product.category?.name || product.category || 'General'
  const productId = product._id || product.id

  useEffect(() => {
    // Load persisted rating from localStorage
    const ratings = JSON.parse(localStorage.getItem('ratings') || '{}')
    if (ratings[productId]) setRating(ratings[productId])

    // Fetch comments from backend
    const fetchComments = async () => {
      try {
        // console.log(`Fetching comments for product ${productId}`);
        const comments = await publicAPI.getProductComments(productId)
        // console.log(`Received comments from backend:`, comments);
        setSavedComments(comments)
      } catch (err) {
        console.error('Failed to fetch comments:', err)
        // Fall back to localStorage if available
        const localComments = JSON.parse(localStorage.getItem('comments') || '{}')
        if (Array.isArray(localComments[productId])) {
          setSavedComments(localComments[productId])
        }
      }
    }

    fetchComments()

    // Check flag status from backend
    const checkFlagStatus = async () => {
      try {
        const flags = await buyerAPI.getBuyerFlags()
        
        const productFlag = flags.find(f => {
          const flagProductId = (f.product?._id || f.product?.id || f.product || '').toString()
          return flagProductId === productId
        })

        if (productFlag) {
          setFlagged(true)
          setFlagResolved(productFlag.resolved)
          // Store flag ID for later deletion
          const localFlags = JSON.parse(localStorage.getItem('flaggedProducts') || '{}')
          localFlags[productId] = { 
            flagged: true, 
            resolved: productFlag.resolved, 
            flagId: productFlag._id
          }
          localStorage.setItem('flaggedProducts', JSON.stringify(localFlags))
        } else {
          // No flag found in backend, clear local storage
          const localFlags = JSON.parse(localStorage.getItem('flaggedProducts') || '{}')
          if (localFlags[productId]) {
            delete localFlags[productId]
            localStorage.setItem('flaggedProducts', JSON.stringify(localFlags))
          }
          setFlagged(false)
          setFlagResolved(false)
        }
      } catch (err) {
        // If API fails, don't show any flags to avoid confusion
        console.error('Failed to fetch flags:', err)
        setFlagged(false)
        setFlagResolved(false)
      }
    }

    checkFlagStatus()
  }, [productId, product.seller])
  
  const handleAddToCart = async () => {
    try {
      await buyerAPI.addToCart(productId, 1)
      setToast({ message: 'Added to cart!', type: 'success' })
    } catch (err) {
      console.error('Error adding to cart:', err)
      setToast({ message: err.message || 'Failed to add to cart', type: 'error' })
    }
  }

  const handleRate = async (value) => {
    try {
      await buyerAPI.rateProduct(productId, value, '')
      const ratings = JSON.parse(localStorage.getItem('ratings') || '{}')
      const updated = { ...ratings, [productId]: value }
      localStorage.setItem('ratings', JSON.stringify(updated))
      setRating(value)
      setToast({ message: `Rated ${value} stars`, type: 'success' })
    } catch (err) {
      console.error('Error rating product:', err)
      setToast({ message: err.message || 'Failed to rate product', type: 'error' })
    }
  }

  const handleSaveComment = async () => {
    if (!comment.trim()) return
    try {
      const commentText = comment.trim()
      console.log(`\n=== FRONTEND COMMENT SAVE ===`)
      console.log(`Product ID: ${productId}`)
      console.log(`Comment text: "${commentText}"`)
      console.log(`Comment length: ${commentText.length} chars`)
      console.log(`Sending to backend endpoint: /buyer/products/${productId}/comment`)
      
      // Send comment to backend
      const response = await buyerAPI.postProductComment(productId, commentText)
      console.log(`\n=== RESPONSE RECEIVED ===`)
      console.log(`Full response:`, response)
      console.log(`Response author object:`, response.author)
      console.log(`Response author name:`, response.author?.name)
      console.log(`Response body:`, response.body)
      
      // Update savedComments with the response from backend (includes author info)
      const authorName = response.author?.name || 'Anonymous'
      console.log(`Using author name: "${authorName}"`)
      
      const newComment = {
        text: response.body,
        author: authorName,
        createdAt: response.createdAt,
        _id: response._id
      }
      console.log(`New comment object:`, newComment)
      setSavedComments([newComment, ...savedComments])
      
      setComment('')
      console.log(`=== COMMENT SAVED SUCCESSFULLY ===\n`)
      setToast({ message: 'Comment saved', type: 'success' })
    } catch (err) {
      console.error('Failed to save comment:', err)
      console.log(`=== COMMENT SAVE FAILED ===\n`)
      setToast({ message: 'Failed to save comment', type: 'error' })
    }
  }

  const handleGetAISummary = async () => {
    try {
      setLoadingSummary(true)
      // Try backend API to get summary
      const res = await buyerAPI.getAISummary(productId)
      setAiSummary(res.summary || 'No summary available yet.')
      setToast({ message: 'AI summary ready', type: 'success' })
    } catch (e) {
      console.error('Failed to load AI summary:', e)
      setToast({ message: 'Failed to load AI summary', type: 'error' })
      setAiSummary('Unable to generate summary at this time.')
    } finally {
      setLoadingSummary(false)
    }
  }

  const handleFlagSeller = async () => {
    setLoadingFlag(true)
    try {
      // If already flagged, unflag it
      if (flagged) {
        // Get flag ID from localStorage
        const localFlags = JSON.parse(localStorage.getItem('flaggedProducts') || '{}')
        const flagData = localFlags[productId]
        
        if (flagData?.flagId) {
          // Delete from backend
          try {
            await buyerAPI.deleteBuyerFlag(flagData.flagId)
          } catch (err) {
            console.error('Failed to delete flag from backend:', err)
          }
        }
        
        // Remove from localStorage
        delete localFlags[productId]
        localStorage.setItem('flaggedProducts', JSON.stringify(localFlags))
        setFlagged(false)
        setFlagResolved(false)
        setToast({ message: 'Product unflagged', type: 'success' })
        return
      }

      // Create flag for this specific product
      try {
        const response = await buyerAPI.flagProduct(productId, 'Flagged by buyer from catalog')
        setToast({ message: 'Product flagged for review', type: 'success' })
        
        // Store in localStorage with flag ID
        const flags = JSON.parse(localStorage.getItem('flaggedProducts') || '{}')
        flags[productId] = { 
          flagged: true, 
          resolved: false, 
          flagId: response._id
        }
        localStorage.setItem('flaggedProducts', JSON.stringify(flags))
        setFlagged(true)
        setFlagResolved(false)
      } catch (err) {
        console.error('Flag error:', err)
        const errorMsg = err.response?.data?.error || err.message || 'Failed to flag product'
        setToast({ message: errorMsg, type: 'error' })
        return
      }
    } finally {
      setLoadingFlag(false)
    }
  }
  
  return (
    <article className="product-card">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="product-image-wrap">
        <Link to={`/products/${productId}`}>
          <img src={productImage} alt={productName} loading="lazy" />
        </Link>
        {product.badge && <span className={`product-badge ${product.badgeType || 'new'}`}>{product.badge}</span>}
      </div>

      <div className="product-info">
        <div className="product-meta">
          <p className="category">{categoryName}</p>
        </div>

        <h3 className="product-name">
          <Link to={`/products/${productId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            {productName}
          </Link>
        </h3>

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
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '8px' }}>
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            style={{ flex: 1, padding: '6px 8px', fontSize: '12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
          />
          <button
            type="button"
            onClick={handleSaveComment}
            style={{ padding: '6px 10px', fontSize: '12px', background: '#3b82f6', color: '#fff', border: 0, borderRadius: '6px' }}
          >
            Save
          </button>
        </div>
        {savedComments.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
            {savedComments.map((c, idx) => (
              <div key={idx} style={{ background: '#f3f4f6', padding: '8px', borderRadius: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '12px', color: '#1f2937' }}>
                    {typeof c.author === 'object' ? (c.author?.name || 'Anonymous') : (c.author || 'Anonymous')}
                  </strong>
                  <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                    {new Date(c.createdAt).toLocaleString()}
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#374151', wordWrap: 'break-word' }}>
                  {c.text || c.body}
                </p>
              </div>
            ))}
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
            className={`flag-btn ${flagged ? (flagResolved ? 'resolved' : 'flagged') : ''}`}
            onClick={handleFlagSeller}
            disabled={loadingFlag}
            title={flagged ? (flagResolved ? 'Resolved - Click to unflag' : 'Flagged - Click to unflag') : 'Flag seller'}
          >
            {loadingFlag ? '⏳...' : flagged ? (flagResolved ? '✅ Resolved' : '🚩 Flagged') : '🚩 Flag seller'}
          </button>
        </div>
      </div>
    </article>
  )
}
