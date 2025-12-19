import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import '../styles/Auth.css'

export default function Signup() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'buyer'
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

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const { confirmPassword, ...userData } = formData
      const response = await authAPI.register(userData)
      
      console.log('✅ Registration successful')
      
      // Auto-login after signup
      const loginResponse = await authAPI.login({
        email: formData.email,
        password: formData.password
      })
      
      localStorage.setItem('token', loginResponse.token)
      localStorage.setItem('user', JSON.stringify(loginResponse.user || { email: formData.email, name: formData.name }))
      
      // Redirect to home page
      navigate('/home')
    } catch (err) {
      setError(err.message || 'Registration failed. Email may already be in use.')
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
          <h2>Create Account</h2>
          <p className="auth-subtitle">Join us and start shopping today</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </div>

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
              placeholder="At least 6 characters"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">I want to</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="role-select"
            >
              <option value="buyer">Buy products</option>
              <option value="seller">Sell products</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>

          <p className="auth-footer-text">
            Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
