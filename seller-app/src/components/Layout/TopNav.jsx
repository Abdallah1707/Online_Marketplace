import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { removeToken, removeSeller } from '../../utils/localStorage'
import { productService } from '../../services/productService'
import { orderService } from '../../services/orderService'
import { authService } from '../../services/authService'
import './TopNav.css'

export default function TopNav({ activeTab, setIsAuthenticated }) {
  const navigate = useNavigate()
  const [showAccount, setShowAccount] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState({ products: [], orders: [] })
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const accountRef = useRef(null)
  const searchRef = useRef(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setShowAccount(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced search effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ products: [], orders: [] })
      setShowSearchResults(false)
      return
    }

    const timeoutId = setTimeout(async () => {
      await performSearch(searchQuery)
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const performSearch = async (query) => {
    if (!query.trim()) return

    setSearchLoading(true)
    setShowSearchResults(true)

    try {
      const lowerQuery = query.toLowerCase()

      // Search products
      let products = []
      try {
        const allProducts = await productService.getSellerProducts()
        products = allProducts.filter(p => 
          p.title?.toLowerCase().includes(lowerQuery) ||
          p.description?.toLowerCase().includes(lowerQuery)
        ).slice(0, 5) // Limit to 5 results
      } catch (err) {
        console.error('Error searching products:', err)
      }

      // Search orders
      let orders = []
      try {
        const allOrders = await orderService.getSellerOrders()
        orders = allOrders.filter(o => {
          const orderId = (o._id || o.id || '').toLowerCase()
          const buyerName = (o.buyer?.name || '').toLowerCase()
          const buyerEmail = (o.buyer?.email || '').toLowerCase()
          const status = (o.status || '').toLowerCase()
          
          return orderId.includes(lowerQuery) ||
                 buyerName.includes(lowerQuery) ||
                 buyerEmail.includes(lowerQuery) ||
                 status.includes(lowerQuery)
        }).slice(0, 5) // Limit to 5 results
      } catch (err) {
        console.error('Error searching orders:', err)
      }

      setSearchResults({ products, orders })
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setSearchLoading(false)
    }
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleProductClick = (productId) => {
    setShowSearchResults(false)
    setSearchQuery('')
    navigate('/products')
  }

  const handleOrderClick = (orderId) => {
    setShowSearchResults(false)
    setSearchQuery('')
    navigate('/orders')
  }

  const handleLogout = () => {
    removeToken()
    removeSeller()
    setIsAuthenticated(false)
    navigate('/login')
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone. All your products and data will be permanently deleted.'
    )
    
    if (!confirmed) return

    const doubleCheck = window.confirm(
      'This is your final warning. Are you absolutely sure you want to permanently delete your account?'
    )

    if (!doubleCheck) return

    try {
      await authService.deleteAccount()
      alert('Your account has been successfully deleted.')
      removeToken()
      removeSeller()
      setIsAuthenticated(false)
      navigate('/login')
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message || 'Failed to delete account'
      alert(`Error: ${errorMsg}`)
    }
  }

  const tabs = ['Dashboard', 'Products', 'Categories', 'Orders', 'Flags']

  return (
    <nav className="topnav">
      <div className="topnav__left">
        <div className="topnav__logo">
          <div className="topnav__logo-mark">S</div>
          <span className="topnav__logo-text">Sellora</span>
        </div>
      </div>

      <div className="topnav__center">
        {tabs.map(tab => (
          <button 
            key={tab}
            className={`topnav__tab ${activeTab === tab ? 'topnav__tab--active' : ''}`}
            onClick={() => {
              if (tab === 'Dashboard') navigate('/dashboard')
              if (tab === 'Products') navigate('/products')
              if (tab === 'Orders') navigate('/orders')
              if (tab === 'Categories') navigate('/categories')
              if (tab === 'Flags') navigate('/flags')
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="topnav__right">
        <div className="topnav__search" ref={searchRef}>
          <span className="topnav__search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Search products, orders..." 
            className="topnav__search-input"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => searchQuery.trim() && setShowSearchResults(true)}
          />
          
          {/* Search Results Dropdown */}
          {showSearchResults && (
            <div className="search-dropdown">
              {searchLoading ? (
                <div className="search-loading">Searching...</div>
              ) : (
                <>
                  {searchResults.products.length === 0 && searchResults.orders.length === 0 ? (
                    <div className="search-empty">
                      <div className="search-empty-icon">🔍</div>
                      <p>No results found for "{searchQuery}"</p>
                    </div>
                  ) : (
                    <>
                      {/* Products Section */}
                      {searchResults.products.length > 0 && (
                        <div className="search-section">
                          <div className="search-section-header">
                            <span className="search-section-icon">📦</span>
                            <h4>Products</h4>
                          </div>
                          {searchResults.products.map(product => (
                            <button
                              key={product._id || product.id}
                              className="search-result-item"
                              onClick={() => handleProductClick(product._id || product.id)}
                            >
                              <div className="search-item-icon">📦</div>
                              <div className="search-item-content">
                                <div className="search-item-title">{product.title}</div>
                                <div className="search-item-meta">
                                  ${product.price?.toFixed(2)}
                                  {product.soldOut && <span className="search-badge sold-out">Sold Out</span>}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Orders Section */}
                      {searchResults.orders.length > 0 && (
                        <div className="search-section">
                          <div className="search-section-header">
                            <span className="search-section-icon">🛍️</span>
                            <h4>Orders</h4>
                          </div>
                          {searchResults.orders.map(order => (
                            <button
                              key={order._id || order.id}
                              className="search-result-item"
                              onClick={() => handleOrderClick(order._id || order.id)}
                            >
                              <div className="search-item-icon">🛍️</div>
                              <div className="search-item-content">
                                <div className="search-item-title">
                                  Order #{(order._id || order.id).slice(-8)}
                                </div>
                                <div className="search-item-meta">
                                  {order.buyer?.name} • ${order.total?.toFixed(2)}
                                  <span className={`search-badge status-${order.status}`}>
                                    {order.status}
                                  </span>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Account Menu */}
        <div className="dropdown" ref={accountRef}>
          <button 
            className="topnav__avatar"
            onClick={() => {
              setShowAccount(!showAccount)
            }}
          >
            👤
          </button>
          {showAccount && (
            <div className="dropdown-menu account-menu">
              <div className="dropdown-header account-header">
                <div className="account-avatar">👤</div>
                <div className="account-info">
                  <h3>Tech Store Owner</h3>
                  <p>seller@techstore.com</p>
                </div>
              </div>
              <div className="dropdown-content">
                <button className="dropdown-item" onClick={() => navigate('/profile')}>
                  <span className="item-icon">👤</span>
                  <span>My Profile</span>
                </button>
                <button className="dropdown-item" onClick={() => navigate('/dashboard')}>
                  <span className="item-icon">📊</span>
                  <span>Dashboard</span>
                </button>
                <button className="dropdown-item" onClick={() => navigate('/products')}>
                  <span className="item-icon">📦</span>
                  <span>My Products</span>
                </button>
                <button className="dropdown-item" onClick={() => navigate('/orders')}>
                  <span className="item-icon">🛒</span>
                  <span>My Orders</span>
                </button>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item logout-item" onClick={handleLogout}>
                  <span className="item-icon">🚪</span>
                  <span>Logout</span>
                </button>
                <button className="dropdown-item delete-account-item" onClick={handleDeleteAccount}>
                  <span className="item-icon">🗑️</span>
                  <span>Delete Account</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <button className="topnav__logout" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  )
}
