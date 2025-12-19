import React, { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Toast from '../components/Toast'
import { buyerAPI } from '../services/api'
import '../styles/Orders.css'

export default function Orders() {
  const [cartItems, setCartItems] = useState([])
  const [orderItems, setOrderItems] = useState([])
  const [activeFilter, setActiveFilter] = useState('All')
  const [toast, setToast] = useState(null)
  const [expandedItem, setExpandedItem] = useState(null)
  const [ratings, setRatings] = useState({})
  const [comments, setComments] = useState({})
  const [aiSummary, setAiSummary] = useState({})
  const [loadingSummary, setLoadingSummary] = useState({})
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  useEffect(() => {
    // Load cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    setCartItems(cart)
    // Load existing orders from localStorage
    const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]')
    setOrderItems(existingOrders)
    // Load ratings and comments from localStorage
    const savedRatings = JSON.parse(localStorage.getItem('ratings') || '{}')
    const savedComments = JSON.parse(localStorage.getItem('comments') || '{}')
    setRatings(savedRatings)
    setComments(savedComments)
  }, [])

  const getStatusBadge = (status) => {
    const statusMap = {
      delivered: { bg: '#dcfce7', text: '#15803d', label: 'Delivered' },
      shipped: { bg: '#dbeafe', text: '#0ea5e9', label: 'Shipped' },
      processing: { bg: '#fef3c7', text: '#92400e', label: 'Processing' },
      pending: { bg: '#fef3c7', text: '#92400e', label: 'Pending' },
      cancelled: { bg: '#fee2e2', text: '#b91c1c', label: 'Cancelled' },
      flagged: { bg: '#fee2e2', text: '#b91c1c', label: 'Flagged' },
    }
    return statusMap[status] || statusMap.pending
  }

  const handleRemoveFromCart = (itemId) => {
    const updatedCart = cartItems.filter(item => item.id !== itemId)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
    setCartItems(updatedCart)
    setToast({ message: 'Item removed from cart', type: 'success' })
  }

  const handleClearCart = () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      localStorage.setItem('cart', JSON.stringify([]))
      setCartItems([])
      setToast({ message: 'Cart cleared', type: 'success' })
    }
  }

  const handleRateProduct = (itemId, rating) => {
    const newRatings = { ...ratings, [itemId]: rating }
    setRatings(newRatings)
    localStorage.setItem('ratings', JSON.stringify(newRatings))
    setToast({ message: `Rated ${rating} stars!`, type: 'success' })
  }

  const handleAddComment = (itemId, comment) => {
    if (comment.trim()) {
      const newComments = { ...comments, [itemId]: comment }
      setComments(newComments)
      localStorage.setItem('comments', JSON.stringify(newComments))
      setToast({ message: 'Comment added!', type: 'success' })
      setExpandedItem(null)
    }
  }

  const handleFlagProduct = (itemId) => {
    // Update in cart if present
    let updated = false
    const updatedCart = cartItems.map(item => {
      if (item.id === itemId) {
        updated = true
        return { ...item, status: 'flagged' }
      }
      return item
    })
    if (updated) {
      localStorage.setItem('cart', JSON.stringify(updatedCart))
      setCartItems(updatedCart)
    } else {
      // Otherwise update in orders if present
      const updatedOrders = orderItems.map(item => (
        item.id === itemId ? { ...item, status: 'flagged' } : item
      ))
      localStorage.setItem('orders', JSON.stringify(updatedOrders))
      setOrderItems(updatedOrders)
    }
    setToast({ message: 'Product flagged. Our team will review it.', type: 'success' })
  }

  const handleGetAISummary = async (itemId) => {
    setLoadingSummary({ ...loadingSummary, [itemId]: true })
    try {
      const summary = await buyerAPI.getAISummary(itemId)
      setAiSummary({ ...aiSummary, [itemId]: summary.summary || 'No summary available' })
      setToast({ message: 'AI summary generated!', type: 'success' })
    } catch (err) {
      setToast({ message: 'Failed to generate summary', type: 'error' })
      console.error('AI Summary Error:', err)
    } finally {
      setLoadingSummary({ ...loadingSummary, [itemId]: false })
    }
  }

  const handleProceedToCheckout = async () => {
    if (cartItems.length === 0) {
      setToast({ message: 'Your cart is empty', type: 'error' })
      return
    }

    setIsCheckingOut(true)
    try {
      // Prepare order data
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.qty,
          price: item.price,
        })),
        totalAmount: parseFloat(calculateTotal()),
        status: 'pending',
      }

      // Call backend API to create order
      const response = await buyerAPI.createOrder(orderData)
      
      setToast({ message: '✅ Order placed successfully!', type: 'success' })
      
      // Move cart items to orders with updated status and reference
      const newOrderItems = cartItems.map((item) => ({
        ...item,
        status: 'processing',
        orderRef: response?.orderId || response?.id || Date.now(),
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      }))
      const updatedOrders = [...orderItems, ...newOrderItems]
      localStorage.setItem('orders', JSON.stringify(updatedOrders))
      setOrderItems(updatedOrders)

      // Clear the cart after successful checkout
      localStorage.setItem('cart', JSON.stringify([]))
      setCartItems([])
      
      console.log('Order created:', response)
    } catch (err) {
      setToast({ message: `❌ Checkout failed: ${err.message}`, type: 'error' })
      console.error('Checkout Error:', err)
    } finally {
      setIsCheckingOut(false)
    }
  }

  const calculateTotal = () => {
    // Total only reflects items in the current cart
    return cartItems.reduce((total, item) => total + (item.price * item.qty), 0).toFixed(2)
  }

  const getFilteredItems = () => {
    // Combine historical order items and current cart
    const allItems = [
      ...orderItems.map((i) => ({ ...i, __source: 'order' })),
      ...cartItems.map((i) => ({ ...i, __source: 'cart' })),
    ]
    if (activeFilter === 'All') return allItems
    return allItems.filter((item) => (item.status || 'pending').toLowerCase() === activeFilter.toLowerCase())
  }

  return (
    <div className="buyer-page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <Navbar active="Orders" />

      <main className="orders-main">
        <div className="orders-header">
          <h1>Orders</h1>
          <p>Your cart items appear here with PROCESSING status.</p>
        </div>

        <div className="orders-filters">
          <div className="chips">
            {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Flagged'].map((chip) => (
              <button
                key={chip}
                className={`filter-chip ${activeFilter === chip ? 'active' : ''}`}
                type="button"
                onClick={() => setActiveFilter(chip)}
              >
                {chip}
              </button>
            ))}
          </div>
          <div className="filters-right">
            {cartItems.length > 0 && (
              <button className="clear-cart-btn" onClick={handleClearCart} type="button">
                Clear Cart
              </button>
            )}
          </div>
        </div>

        <div className="orders-list">
          {getFilteredItems().length === 0 ? (
            <div className="empty-cart">
              <p>{activeFilter === 'All' ? 'Your cart is empty.' : `No items with status "${activeFilter}".`} Start by adding products from the Products page!</p>
            </div>
          ) : (
            getFilteredItems().map((item) => {
              const statusInfo = getStatusBadge(item.status)
              return (
                <div key={item.id} className="order-card">
                  <div className="order-header-row">
                    <div className="order-info">
                      <div className="order-id">Product</div>
                      <h3>{item.name}</h3>
                      <p className="order-date">{item.date}</p>
                    </div>
                    <div
                      className="status-badge"
                      style={{ background: statusInfo.bg, color: statusInfo.text }}
                    >
                      {statusInfo.label}
                    </div>
                  </div>

                  <div className="order-content">
                    <div className="items-summary">
                      <div className="summary-item">
                        <div className="thumb" style={{ backgroundImage: `url(${item.image})` }} />
                        <div className="summary-text">
                          <p className="product-name">{item.name}</p>
                          <p className="product-qty">Qty: {item.qty}</p>
                          <p className="product-price">${item.price}</p>
                        </div>
                      </div>
                      <p className="delivery-note">Preparing to ship</p>
                    </div>

                    {/* Rating Section */}
                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                      <p style={{ fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>Rate this product:</p>
                      <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => handleRateProduct(item.id, star)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '20px',
                              opacity: (ratings[item.id] || 0) >= star ? 1 : 0.3,
                              transition: 'opacity 0.2s',
                            }}
                            type="button"
                          >
                            ⭐
                          </button>
                        ))}
                      </div>
                      {ratings[item.id] && <p style={{ fontSize: '12px', color: '#666' }}>You rated: {ratings[item.id]} stars</p>}
                    </div>

                    {/* Comment Section */}
                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                      {comments[item.id] ? (
                        <div style={{ backgroundColor: '#f3f4f6', padding: '8px 12px', borderRadius: '6px' }}>
                          <p style={{ fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Your comment:</p>
                          <p style={{ fontSize: '13px', margin: 0 }}>{comments[item.id]}</p>
                        </div>
                      ) : (
                        <button
                          onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#3b82f6',
                            cursor: 'pointer',
                            fontSize: '13px',
                            padding: 0,
                          }}
                          type="button"
                        >
                          Add a comment...
                        </button>
                      )}
                      {expandedItem === item.id && (
                        <div style={{ marginTop: '8px' }}>
                          <textarea
                            id={`comment-${item.id}`}
                            placeholder="Share your feedback..."
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontFamily: 'inherit',
                              resize: 'vertical',
                              minHeight: '60px',
                            }}
                          />
                          <button
                            onClick={() => {
                              const textarea = document.getElementById(`comment-${item.id}`)
                              handleAddComment(item.id, textarea.value)
                              textarea.value = ''
                            }}
                            style={{
                              marginTop: '6px',
                              padding: '6px 12px',
                              background: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '12px',
                              cursor: 'pointer',
                            }}
                            type="button"
                          >
                            Post Comment
                          </button>
                        </div>
                      )}
                    </div>

                    {/* AI Summary Section */}
                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                      {aiSummary[item.id] ? (
                        <div style={{ backgroundColor: '#f0f9ff', padding: '10px 12px', borderRadius: '6px', borderLeft: '3px solid #0ea5e9' }}>
                          <p style={{ fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#0369a1' }}>🤖 AI Summary:</p>
                          <p style={{ fontSize: '13px', margin: 0, color: '#0c4a6e' }}>{aiSummary[item.id]}</p>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleGetAISummary(item.id)}
                          disabled={loadingSummary[item.id]}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#0ea5e9',
                            cursor: loadingSummary[item.id] ? 'not-allowed' : 'pointer',
                            fontSize: '13px',
                            padding: 0,
                            opacity: loadingSummary[item.id] ? 0.6 : 1,
                          }}
                          type="button"
                        >
                          {loadingSummary[item.id] ? '⏳ Generating summary...' : '🤖 View AI Summary'}
                        </button>
                      )}
                    </div>

                    <div className="order-footer">
                      <strong className="order-total">${(item.price * item.qty).toFixed(2)}</strong>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleFlagProduct(item.id)}
                          style={{
                            padding: '6px 12px',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                          }}
                          type="button"
                          title="Flag this product or seller"
                        >
                          🚩 Flag
                        </button>
                        {item.__source === 'cart' && (
                          <button 
                            className="remove-btn" 
                            type="button"
                            onClick={() => handleRemoveFromCart(item.id)}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-summary">
            <div className="summary-content">
              <h3>Cart Summary</h3>
              <div className="summary-row">
                <span>Subtotal ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''}):</span>
                <span>${calculateTotal()}</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>${calculateTotal()}</span>
              </div>
              <button 
                className="checkout-btn" 
                type="button"
                onClick={handleProceedToCheckout}
                disabled={isCheckingOut}
                style={{ opacity: isCheckingOut ? 0.6 : 1, cursor: isCheckingOut ? 'not-allowed' : 'pointer' }}
              >
                {isCheckingOut ? '⏳ Processing...' : '✓ Proceed to Checkout'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
