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

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log('Fetching orders...')
        // Fetch orders from backend
        const ordersData = await buyerAPI.getOrders()
        console.log('Orders data received:', ordersData)
        setOrderItems(ordersData || [])

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

    fetchOrders()
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
    return orderItems.filter((item) => (item.status || 'pending').toLowerCase() === activeFilter.toLowerCase())
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
              return (
                <div key={item._id} className="order-card">
                  <div className="order-header-row">
                    <div className="order-info">
                      <div className="order-id">Order #{item._id.slice(-8)}</div>
                      <h3>Status: {statusInfo.label}</h3>
                      <p className="order-date">{new Date(item.createdAt).toLocaleDateString()}</p>
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
                </div>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}
