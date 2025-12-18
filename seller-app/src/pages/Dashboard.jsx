import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { productService } from '../services/productService'
import { orderService } from '../services/orderService'
import './Dashboard.css'

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  })
  const [recentProducts, setRecentProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch products
      const products = await productService.getSellerProducts()
      
      // Fetch orders
      let orders = []
      try {
        orders = await orderService.getSellerOrders()
      } catch (err) {
        // Orders endpoint might not be implemented yet
        console.log('Orders not available yet')
      }

      // Calculate stats
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0)
      const pendingOrders = orders.filter(o => o.status === 'pending').length

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue,
        pendingOrders,
      })

      // Get 3 most recent products
      setRecentProducts(products.slice(0, 3))
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div>
          <h1 className="dashboard__title">Dashboard</h1>
          <p className="dashboard__subtitle">Overview of your store performance</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="dashboard__stats">
        <div className="stat-card stat-card--primary">
          <div className="stat-card__icon">📦</div>
          <div className="stat-card__content">
            <div className="stat-card__value">{loading ? '...' : stats.totalProducts}</div>
            <div className="stat-card__label">Total Products</div>
          </div>
        </div>

        <div className="stat-card stat-card--success">
          <div className="stat-card__icon">🛍️</div>
          <div className="stat-card__content">
            <div className="stat-card__value">{loading ? '...' : stats.totalOrders}</div>
            <div className="stat-card__label">Total Orders</div>
          </div>
        </div>

        <div className="stat-card stat-card--revenue">
          <div className="stat-card__icon">💰</div>
          <div className="stat-card__content">
            <div className="stat-card__value">
              {loading ? '...' : `$${stats.totalRevenue.toLocaleString()}`}
            </div>
            <div className="stat-card__label">Total Revenue</div>
          </div>
        </div>

        <div className="stat-card stat-card--warning">
          <div className="stat-card__icon">⏳</div>
          <div className="stat-card__content">
            <div className="stat-card__value">{loading ? '...' : stats.pendingOrders}</div>
            <div className="stat-card__label">Pending Orders</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard__quick-actions">
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-actions-grid">
          <button className="action-card" onClick={() => navigate('/products')}>
            <div className="action-card__icon">➕</div>
            <div className="action-card__content">
              <h3>Add Product</h3>
              <p>List a new item for sale</p>
            </div>
          </button>

          <button className="action-card" onClick={() => navigate('/products')}>
            <div className="action-card__icon">📋</div>
            <div className="action-card__content">
              <h3>View Products</h3>
              <p>Manage your inventory</p>
            </div>
          </button>

          <button className="action-card" onClick={() => navigate('/orders')}>
            <div className="action-card__icon">📊</div>
            <div className="action-card__content">
              <h3>View Orders</h3>
              <p>Check pending orders</p>
            </div>
          </button>

          <button className="action-card" onClick={() => navigate('/categories')}>
            <div className="action-card__icon">🏷️</div>
            <div className="action-card__content">
              <h3>Categories</h3>
              <p>Organize your products</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Products */}
      {!loading && recentProducts.length > 0 && (
        <div className="dashboard__recent">
          <h2 className="section-title">Recent Products</h2>
          <div className="recent-products-grid">
            {recentProducts.map((product) => (
              <div key={product._id} className="recent-product-card">
                <div className="recent-product__icon">📦</div>
                <div className="recent-product__info">
                  <h3>{product.title}</h3>
                  <p className="recent-product__price">${product.price}</p>
                  <p className="recent-product__category">
                    {product.category?.name || 'No category'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Welcome Message */}
      <div className="dashboard__welcome">
        <div className="welcome-icon">👋</div>
        <div className="welcome-content">
          <h2>Welcome to Sellora!</h2>
          <p>
            Manage your products, track orders, and grow your business. Use the quick actions above
            or navigate through the menu to get started.
          </p>
        </div>
      </div>
    </div>
  )
}
