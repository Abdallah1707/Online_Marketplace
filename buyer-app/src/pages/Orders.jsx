import React, { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import '../styles/Orders.css'

export default function Orders() {
  const [cartItems, setCartItems] = useState([])
  const [activeFilter, setActiveFilter] = useState('All')

  useEffect(() => {
    // Load cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    setCartItems(cart)
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
  }

  const handleClearCart = () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      localStorage.setItem('cart', JSON.stringify([]))
      setCartItems([])
    }
  }

  const calculateTotal = () => {
    const items = getFilteredItems()
    return items.reduce((total, item) => total + (item.price * item.qty), 0).toFixed(2)
  }

  const getFilteredItems = () => {
    if (activeFilter === 'All') return cartItems
    return cartItems.filter((item) => item.status.toLowerCase() === activeFilter.toLowerCase())
  }

  return (
    <div className="buyer-page">
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

                    <div className="order-footer">
                      <strong className="order-total">${(item.price * item.qty).toFixed(2)}</strong>
                      <button 
                        className="remove-btn" 
                        type="button"
                        onClick={() => handleRemoveFromCart(item.id)}
                      >
                        Remove
                      </button>
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
              <button className="checkout-btn" type="button">
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
