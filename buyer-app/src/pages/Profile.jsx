import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import '../styles/Profile.css'

export default function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(null)

  useEffect(() => {
    // Get user data from localStorage
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setUser(userData)
      setFormData(userData)
    }
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = () => {
    // Update localStorage
    localStorage.setItem('user', JSON.stringify(formData))
    setUser(formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData(user)
    setIsEditing(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  if (!user) {
    return (
      <div className="buyer-page">
        <Navbar />
        <main className="profile-main">
          <p>Loading...</p>
        </main>
      </div>
    )
  }

  // Get user initials
  const getInitials = (name) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
  }

  const sections = [
    { label: 'Personal Info', icon: '👤' },
    { label: 'Wishlist', icon: '♡' },
    { label: 'Notifications', icon: '🔔' },
  ]

  return (
    <div className="buyer-page">
      <Navbar />

      <main className="profile-main">
        <div className="profile-header">
          <div className="profile-card">
            <div className="avatar-section">
              <div className="avatar-circle">{getInitials(user.name)}</div>
              <div className="profile-info">
                <h1>{user.name}</h1>
                <p className="profile-email">{user.email}</p>
              </div>
            </div>
            <button 
              className="edit-profile-btn" 
              type="button"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          </div>
        </div>

        <div className="profile-content">
          <aside className="profile-sidebar">
            <nav className="profile-nav">
              {sections.map((section) => (
                <button
                  key={section.label}
                  className={`profile-nav-item ${section.label === 'Personal Info' ? 'active' : ''}`}
                  type="button"
                >
                  <span className="nav-icon">{section.icon}</span>
                  <span>{section.label}</span>
                </button>
              ))}
            </nav>

            <button className="logout-btn" type="button">
              Logout
            </button>
          </aside>

          <section className="profile-section">
            <h2>Personal Information</h2>

            <div className="info-grid">
              <div className="info-field">
                <label>Full Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData?.name || ''} 
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                />
              </div>

              <div className="info-field">
                <label>Email Address</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData?.email || ''} 
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                />
              </div>

              <div className="info-field">
                <label>Phone Number</label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData?.phone || ''} 
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                />
              </div>

              <div className="info-field">
                <label>Member Since</label>
                <input type="text" value="January 2024" readOnly />
              </div>
            </div>

            <div className="profile-actions">
              {isEditing ? (
                <>
                  <button className="primary-btn" type="button" onClick={handleSave}>
                    Save Changes
                  </button>
                  <button className="secondary-btn" type="button" onClick={handleCancel}>
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button className="primary-btn" type="button" onClick={() => setIsEditing(true)}>
                    Update Information
                  </button>
                  <button className="secondary-btn" type="button">
                    Change Password
                  </button>
                </>
              )}
              <button className="logout-btn" type="button" onClick={handleLogout}>
                Logout
              </button>
            </div>

          </section>
        </div>
      </main>
    </div>
  )
}
