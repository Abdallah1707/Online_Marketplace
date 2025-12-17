import './Dashboard.css'

export default function Dashboard() {
  return (
    <div className="dashboard">
      <h1 className="dashboard__title">Dashboard</h1>
      
      <div className="dashboard__stats">
        <div className="stat-card">
          <div className="stat-card__value">24</div>
          <div className="stat-card__label">Total Products</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">156</div>
          <div className="stat-card__label">Total Orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">$12,450</div>
          <div className="stat-card__label">Total Revenue</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">4.8★</div>
          <div className="stat-card__label">Seller Rating</div>
        </div>
      </div>

      <div className="dashboard__welcome">
        <h2>Welcome to Sellora!</h2>
        <p>Manage your products, orders, and grow your business. Use the navigation tabs above to explore.</p>
      </div>
    </div>
  )
}
