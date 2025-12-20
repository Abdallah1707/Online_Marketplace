import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import '../styles/Navbar.css'

export default function Navbar({ active }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [user, setUser] = useState(null)
  const navItems = ['Home', 'Products', 'Cart', 'Orders', 'Profile']

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [pathname])

  const getInitials = (name) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2)
  }

  return (
    <nav className="navbar">
      <div className="nav-left">
        <div className="logo-circle">S</div>
        <span className="app-name">Buy It</span>
      </div>

      <div className="nav-center">
        {navItems.map((item) => {
          const to = `/${item.toLowerCase() === 'home' ? 'home' : item.toLowerCase()}`
          const isActive = active
            ? item === active
            : pathname === to || (item === 'Home' && pathname === '/home')
          return (
            <Link key={item} to={to} className={`nav-pill ${isActive ? 'active' : ''}`}>
              {item}
            </Link>
          )
        })}
      </div>

      <div className="nav-right">
        <div className="search-bar">
          <span className="search-icon" aria-hidden>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const q = query.trim()
                navigate(q ? `/products?q=${encodeURIComponent(q)}` : '/products')
              }
            }}
          />
        </div>


        <div className="avatar">{getInitials(user?.name)}</div>
      </div>
    </nav>
  )
}
