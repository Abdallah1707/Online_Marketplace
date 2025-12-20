import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Toast from '../components/Toast'
import Navbar from '../components/Navbar'
import { publicAPI, buyerAPI } from '../services/api'
import '../styles/ProductDetail.css'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [comments, setComments] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [addingToCart, setAddingToCart] = useState(false)

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch product details
        const productData = await publicAPI.getProductById(id)
        // console.log('Product data loaded:', productData)
        setProduct(productData)

        // Fetch product comments
        try {
          const commentsData = await publicAPI.getProductComments(id)
          setComments(commentsData || [])
        } catch (commentError) {
          console.warn('Could not fetch comments:', commentError)
          setComments([])
        }

      } catch (err) {
        console.error('Error fetching product:', err)
        setError(err.message || 'Failed to load product')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProductData()
    }
  }, [id])

  const handleAddToCart = async () => {
    alert('Adding to cart clicked')
    if (!product) return

    console.log('Adding to cart:', product._id || product.id, quantity)
    try {
      setAddingToCart(true)
      await buyerAPI.addToCart(product._id || product.id, quantity)
      setToast({ message: `Added ${quantity} item(s) to cart!`, type: 'success' })
      setQuantity(1)
    } catch (err) {
      console.error('Error adding to cart:', err)
      setToast({ message: err.message || 'Failed to add to cart', type: 'error' })
    } finally {
      setAddingToCart(false)
    }
  }

  const handleQuantityChange = (value) => {
    const num = parseInt(value) || 1
    setQuantity(Math.max(1, num))
  }

  const handleIncrement = () => setQuantity(q => q + 1)
  const handleDecrement = () => setQuantity(q => (q > 1 ? q - 1 : 1))

  if (loading) {
    return (
      <div className="buyer-page">
        <Navbar />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
          fontSize: '18px'
        }}>
          Loading product...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="buyer-page">
        <Navbar />
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
          fontSize: '18px',
          color: '#dc3545'
        }}>
          <p>Error: {error}</p>
          <button
            onClick={() => window.history.back()}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="buyer-page">
        <Navbar />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
          fontSize: '18px'
        }}>
          Product not found
        </div>
      </div>
    )
  }

  return (
    <div className="buyer-page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <Navbar />

      <main className="detail-main">
        <div className="breadcrumb">
          <a href="/home">Home</a>
          <span>›</span>
          <a href="/products">Products</a>
          <span>›</span>
          <span>{product.name}</span>
        </div>

        <div className="product-detail">
          <div className="detail-left">
            <div className="hero-image">
              <img src={product.image || product.images?.[0]} alt={product.name} />
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="on-sale">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                </span>
              )}
            </div>

            <div className="thumbnail-gallery">
              <div className="thumbnail active">
                <img src={product.image || product.images?.[0]} alt="View 1" />
              </div>
              {(product.images || []).slice(1, 4).map((img, idx) => (
                <div key={idx} className="thumbnail">
                  <img src={img} alt={`View ${idx + 2}`} />
                </div>
              ))}
            </div>
          </div>

          <div className="detail-right">
            <div className="detail-header">
              <div>
                <p className="detail-category">{product.category}</p>
                <h1>{product.name}</h1>
              </div>
              <button className="wishlist-btn" type="button">
                ♡
              </button>
            </div>

            <div className="rating-section">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`star ${i < Math.floor(product.rating || 0) ? 'filled' : ''}`}>
                    ★
                  </span>
                ))}
              </div>
              <span className="rating-score">{product.rating || 0}</span>
              <span className="review-count">({comments.length} reviews)</span>
            </div>

            <div className="pricing-section">
              <div className="price-group">
                <span className="current-price">${product.price}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="original-price">${product.originalPrice}</span>
                )}
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="discount">Save ${product.originalPrice - product.price}</span>
                )}
              </div>
              <div className={`stock-status ${product.inStock !== false ? 'available' : 'unavailable'}`}>
                {product.inStock !== false ? '✓ In Stock • Usually ships in 2-3 business days' : '✗ Out of Stock'}
              </div>
            </div>

            <div className="description-section">
              <p>{product.description}</p>
            </div>

            <div className="specs-section">
              <h3>Key Specs</h3>
              <ul className="specs-grid">
                {(product.specs || []).map((spec, idx) => (
                  <li key={idx}>
                    <span className="spec-label">{spec.label}</span>
                    <span className="spec-value">{spec.value}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="actions-section">
              <div className="quantity-picker">
                <button type="button" onClick={handleDecrement}>−</button>
                <input type="number" value={quantity} min="1" onChange={(e) => handleQuantityChange(e.target.value)} />
                <button type="button" onClick={handleIncrement}>+</button>
              </div>

              <button
                className="add-to-cart-large"
                type="button"
                onClick={handleAddToCart}
                disabled={addingToCart || product.inStock === false}
              >
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </button>

              <button className="buy-now" type="button">
                Buy Now
              </button>
            </div>

            <div className="trust-badges">
              <div className="badge">
                <span className="badge-icon">🛡</span>
                <span>Secure Checkout</span>
              </div>
              <div className="badge">
                <span className="badge-icon">↩</span>
                <span>30-Day Returns</span>
              </div>
              <div className="badge">
                <span className="badge-icon">⚡</span>
                <span>Fast Shipping</span>
              </div>
            </div>
          </div>
        </div>

        <section className="reviews-section">
          <h2>Customer Reviews ({comments.length})</h2>
          <div className="reviews-list">
            {comments.length > 0 ? (
              comments.map((comment, idx) => (
                <div key={comment._id || idx} className="review-card">
                  <div className="review-header">
                    <div>
                      <strong>{comment.author?.name || 'Anonymous'}</strong>
                      <div className="review-stars">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`star ${i < (comment.rating || 0) ? 'filled' : ''}`}>
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="review-date">
                      {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <p className="review-text">{comment.body || comment.text}</p>
                </div>
              ))
            ) : (
              <p className="no-reviews">No reviews yet. Be the first to review this product!</p>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
