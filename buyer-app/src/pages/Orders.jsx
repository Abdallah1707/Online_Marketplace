import React, { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Toast from '../components/Toast'
import { buyerAPI } from '../services/api'
import '../styles/Orders.css'

export default function Orders() {
  const [orderItems, setOrderItems] = useState([])
  const [activeFilter, setActiveFilter] = useState('All')
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [commentText, setCommentText] = useState({}) // Store comments per order ID
  const [submittingComment, setSubmittingComment] = useState({}) // Track submission state per order
  const [flagsAgainstMe, setFlagsAgainstMe] = useState([]) // Store flags against this buyer
  const [showFlagDetails, setShowFlagDetails] = useState(null) // Track which flag details to show
  const [resolvingFlag, setResolvingFlag] = useState(null) // Track which flag is being resolved

  useEffect(() => {
    const fetchOrdersAndFlags = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log('Fetching orders...')
        // Fetch orders from backend
        const ordersData = await buyerAPI.getOrders()
        console.log('Orders data received:', ordersData)
        setOrderItems(ordersData || [])

        // Fetch flags against this buyer
        try {
          const flags = await buyerAPI.getFlagsAgainstMe()
          setFlagsAgainstMe(flags || [])
        } catch (flagErr) {
          console.warn('Could not fetch flags:', flagErr)
        }

      } catch (err) {
        console.error('Error fetching orders:', err)
        setError(err.message || 'Failed to load orders')
        // Fallback to localStorage if API fails
        const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]')
        setOrderItems(existingOrders)
      } finally {
        setLoading(false)
      }
    }

    fetchOrdersAndFlags()
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

  const getFilteredItems = () => {
    if (activeFilter === 'All') return orderItems
    if (activeFilter === 'Flagged') {
      // Show orders that have flags against the buyer
      return orderItems.filter((item) => {
        return flagsAgainstMe.some(flag => 
          flag.order && (flag.order._id === item._id || flag.order === item._id)
        )
      })
    }
    return orderItems.filter((item) => (item.status || 'pending').toLowerCase() === activeFilter.toLowerCase())
  }

  const handleAddComment = async (orderId) => {
    const comment = commentText[orderId]?.trim()
    if (!comment) {
      setToast({ message: 'Please enter a comment', type: 'error' })
      return
    }

    setSubmittingComment({ ...submittingComment, [orderId]: true })
    try {
      await buyerAPI.addOrderComment(orderId, comment)
      setToast({ message: 'Comment added successfully', type: 'success' })
      setCommentText({ ...commentText, [orderId]: '' })
    } catch (err) {
      console.error('Error adding comment:', err)
      setToast({ message: err.message || 'Failed to add comment', type: 'error' })
    } finally {
      setSubmittingComment({ ...submittingComment, [orderId]: false })
    }
  }

  const handleResolveFlag = async (flagId) => {
    setResolvingFlag(flagId)
    try {
      const resolvedFlag = await buyerAPI.resolveFlagAgainstMe(flagId)
      // Update the flags list with the resolved flag
      setFlagsAgainstMe(flagsAgainstMe.map(f => f._id === flagId ? resolvedFlag : f))
      setToast({ message: 'Flag resolved successfully', type: 'success' })
    } catch (err) {
      console.error('Error resolving flag:', err)
      setToast({ message: err.message || 'Failed to resolve flag', type: 'error' })
    } finally {
      setResolvingFlag(null)
    }
  }

  if (loading) {
    return (
      <div className="buyer-page">
        <Navbar active="Orders" />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
          fontSize: '18px'
        }}>
          Loading orders...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="buyer-page">
        <Navbar active="Orders" />
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
            onClick={() => window.location.reload()}
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
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="buyer-page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <Navbar active="Orders" />

      <main className="orders-main">
        <div className="orders-header">
          <h1>Order History</h1>
          <p>Track your order status and history.</p>
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
        </div>

        <div className="orders-list">
          {getFilteredItems().length === 0 ? (
            <div className="empty-cart">
              <p>{activeFilter === 'All' ? 'You have no orders yet.' : `No orders with status "${activeFilter}".`} Start shopping to place your first order!</p>
            </div>
          ) : (
            getFilteredItems().map((item) => {
              const statusInfo = getStatusBadge(item.status)
              // Check if this order has a flag against the buyer
              const orderFlag = flagsAgainstMe.find(flag => 
                flag.order && (flag.order._id === item._id || flag.order === item._id)
              )
              
              return (
                <div key={item._id} className="order-card">
                  <div className="order-header-row">
                    <div className="order-info">
                      <div className="order-id">Order #{item._id.slice(-8)}</div>
                      <h3>Status: {statusInfo.label}</h3>
                      <p className="order-date">{new Date(item.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        className="status-badge"
                        style={{ background: statusInfo.bg, color: statusInfo.text }}
                      >
                        {statusInfo.label}
                      </div>
                      {orderFlag && (
                        <div 
                          className="flag-badge"
                          onClick={() => setShowFlagDetails(showFlagDetails === orderFlag._id ? null : orderFlag._id)}
                          style={{ cursor: 'pointer' }}
                          title="Click to see flag details"
                        >
                          ⚠️ Flagged
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Flag Details */}
                  {orderFlag && showFlagDetails === orderFlag._id && (
                    <div className="flag-details">
                      <p><strong>Flagged by seller:</strong> {orderFlag.reporter?.name || 'Seller'}</p>
                      <p><strong>Reason:</strong> {orderFlag.reason || 'No reason provided'}</p>
                      <p><strong>Date:</strong> {new Date(orderFlag.createdAt).toLocaleString()}</p>
                      {!orderFlag.resolved && (
                        <>
                          <p style={{ color: '#dc2626', fontWeight: '500' }}>⚠️ This flag is unresolved</p>
                          <button
                            onClick={() => handleResolveFlag(orderFlag._id)}
                            disabled={resolvingFlag === orderFlag._id}
                            className="resolve-flag-btn"
                            style={{
                              marginTop: '12px',
                              padding: '8px 16px',
                              background: '#16a34a',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              fontWeight: '600',
                              fontSize: '14px',
                              cursor: resolvingFlag === orderFlag._id ? 'not-allowed' : 'pointer',
                              opacity: resolvingFlag === orderFlag._id ? 0.6 : 1
                            }}
                          >
                            {resolvingFlag === orderFlag._id ? 'Resolving...' : 'Mark as Resolved'}
                          </button>
                        </>
                      )}
                      {orderFlag.resolved && <p style={{ color: '#16a34a', fontWeight: '500' }}>✓ This flag has been resolved</p>}
                    </div>
                  )}

                  <div className="order-content">
                    <div className="items-summary">
                      {item.items.map((orderItem, idx) => (
                        <div key={idx} className="summary-item">
                          <div className="summary-text">
                            <p className="product-name">{orderItem.product.title}</p>
                            <p className="product-qty">Qty: {orderItem.quantity}</p>
                            <p className="product-price">${orderItem.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="order-footer">
                      <strong className="order-total">Total: ${item.total}</strong>
                    </div>
                  </div>

                  {/* Add Comment Section */}
                  <div className="comment-section">
                    <label className="comment-label">
                      Add a comment about this order:
                    </label>
                    <textarea
                      value={commentText[item._id] || ''}
                      onChange={(e) => setCommentText({ ...commentText, [item._id]: e.target.value })}
                      placeholder="Share your thoughts about this order..."
                      className="comment-textarea"
                    />
                    <button
                      onClick={() => handleAddComment(item._id)}
                      disabled={submittingComment[item._id]}
                      className="comment-btn"
                      style={{
                        backgroundColor: submittingComment[item._id] ? '#9ca3af' : '#4f46e5',
                        cursor: submittingComment[item._id] ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {submittingComment[item._id] ? 'Submitting...' : 'Add Comment'}
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}
