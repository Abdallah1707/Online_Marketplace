import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import '../styles/Auth.css'

export default function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await authAPI.login(formData)
      
      // Store token and user info, preserving existing name if backend doesn't return it
      localStorage.setItem('token', response.token)
      const existingUser = JSON.parse(localStorage.getItem('user') || 'null')
      const mergedUser = {
        email: (response.user && response.user.email) || formData.email,
        name: (response.user && response.user.name) || (existingUser && existingUser.name) || '',
        phone: (response.user && response.user.phone) || (existingUser && existingUser.phone) || '',
        ...response.user
      }
      localStorage.setItem('user', JSON.stringify(mergedUser))
      
      console.log('✅ Login successful')
      
      // Redirect to home page
      navigate('/home')
    } catch (err) {
      setError(err.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="logo-section">
            <div className="logo-circle-large">S</div>
            <h1>Sellora</h1>
          </div>
          <h2>Welcome Back</h2>
          <p className="auth-subtitle">Sign in to continue shopping</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="auth-footer-text">
            Don't have an account? <Link to="/signup" className="auth-link">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
