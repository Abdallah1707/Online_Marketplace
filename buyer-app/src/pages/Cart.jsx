import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Toast from '../components/Toast'
import { buyerAPI } from '../services/api'
import '../styles/Cart.css'

export default function Cart() {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Fetching cart...')
      const cartData = await buyerAPI.getCart()
      console.log('Cart data received:', cartData)
      setCartItems(cartData.items || [])
    } catch (err) {
      console.error('Error fetching cart:', err)
      setError(err.message || 'Failed to load cart')
      // Fallback to localStorage
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      setCartItems(cart)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFromCart = async (productId) => {
    try {
      await buyerAPI.removeFromCart(productId)
      setCartItems(cartItems.filter(item => (item.product?._id || item.product?.id || item.id) !== productId))
      setToast({ message: 'Item removed from cart', type: 'success' })
    } catch (err) {
      console.error('Error removing from cart:', err)
      setToast({ message: err.message || 'Failed to remove item', type: 'error' })
    }
  }

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return

    try {
      await buyerAPI.updateCartItem(productId, newQuantity)
      setCartItems(cartItems.map(item => {
        const itemId = item.product?._id || item.product?.id || item.id
        if (itemId === productId) {
          return { ...item, quantity: newQuantity }
        }
        return item
      }))
      setToast({ message: 'Quantity updated', type: 'success' })
    } catch (err) {
      console.error('Error updating quantity:', err)
      setToast({ message: err.message || 'Failed to update quantity', type: 'error' })
    }
  }

  const handleClearCart = async () => {
    if (!confirm('Are you sure you want to clear your cart?')) return

    try {
      await buyerAPI.clearCart()
      setCartItems([])
      setToast({ message: 'Cart cleared', type: 'success' })
    } catch (err) {
      console.error('Error clearing cart:', err)
      setToast({ message: err.message || 'Failed to clear cart', type: 'error' })
    }
  }

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      setToast({ message: 'Your cart is empty', type: 'error' })
      return
    }

    try {
      setIsCheckingOut(true)

      // Prepare order data
      const orderData = {
        items: cartItems.map(item => ({
          product: item.product?._id || item.product?.id || item.id,
          quantity: item.quantity || item.qty,
          price: item.price
        })),
        totalAmount: getTotalPrice()
      }

      // Create order
      const orderResponse = await buyerAPI.createOrder(orderData)

      // Clear cart after successful order
      await buyerAPI.clearCart()
      setCartItems([])

      setToast({ message: 'Order placed successfully!', type: 'success' })

      // Redirect to orders page after a short delay
      setTimeout(() => {
        navigate('/orders')
      }, 2000)

    } catch (err) {
      console.error('Error creating order:', err)
      setToast({ message: err.message || 'Failed to place order', type: 'error' })
    } finally {
      setIsCheckingOut(false)
    }
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * (item.quantity || item.qty)), 0).toFixed(2)
  }

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + (item.quantity || item.qty), 0)
  }

  if (loading) {
    return (
      <div className="buyer-page">
        <Navbar active="Cart" />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
          fontSize: '18px'
        }}>
          Loading cart...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="buyer-page">
        <Navbar active="Cart" />
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
            onClick={fetchCart}
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

      <Navbar active="Cart" />

      <main className="cart-main">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <p>{getTotalItems()} item(s) in your cart</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-content">
              <h2>Your cart is empty</h2>
              <p>Add some products to get started!</p>
              <button
                className="continue-shopping-btn"
                onClick={() => navigate('/products')}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cartItems.map((item) => {
                const product = item.product || item
                const quantity = item.quantity || item.qty || 1
                const price = item.price || 0

                return (
                  <div key={product._id || product.id} className="cart-item">
                    <div className="item-image">
                      <img
                        src={product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80'}
                        alt={product.title}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80'
                        }}
                      />
                    </div>

                    <div className="item-details">
                      <h3>{product.title}</h3>
                      <p className="item-category">{product.category?.name || product.category || 'General'}</p>
                      <p className="item-price">${price}</p>
                    </div>

                    <div className="item-quantity">
                      <button
                        onClick={() => handleUpdateQuantity(product._id || product.id, quantity - 1)}
                        disabled={quantity <= 1}
                      >
                        −
                      </button>
                      <span>{quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(product._id || product.id, quantity + 1)}
                      >
                        +
                      </button>
                    </div>

                    <div className="item-total">
                      <p>${(price * quantity).toFixed(2)}</p>
                    </div>

                    <div className="item-actions">
                      <button
                        className="remove-btn"
                        onClick={() => handleRemoveFromCart(product._id || product.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="cart-summary">
              <div className="summary-row">
                <span>Total Items:</span>
                <span>{getTotalItems()}</span>
              </div>
              <div className="summary-row total">
                <span>Total Price:</span>
                <span>${getTotalPrice()}</span>
              </div>

              <div className="cart-actions">
                <button
                  className="clear-cart-btn"
                  onClick={handleClearCart}
                >
                  Clear Cart
                </button>
                <button
                  className="checkout-btn"
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                >
                  {isCheckingOut ? 'Placing Order...' : 'Checkout'}
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}