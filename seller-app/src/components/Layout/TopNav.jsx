import { useNavigate } from 'react-router-dom'
import { removeToken, removeSeller } from '../../utils/localStorage'
import './TopNav.css'

export default function TopNav({ activeTab }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    removeToken()
    removeSeller()
    navigate('/login')
  }

  const tabs = ['Dashboard', 'Products', 'Orders', 'Marketing', 'Analytics']

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
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="topnav__right">
        <div className="topnav__search">
          <span className="topnav__search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="topnav__search-input"
          />
        </div>
        <button className="topnav__icon-btn">🔔</button>
        <button className="topnav__icon-btn">⚙️</button>
        <button className="topnav__avatar">👤</button>
        <button className="topnav__logout" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  )
}
