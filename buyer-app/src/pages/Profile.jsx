import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { authAPI } from '../services/api' // Ensure deleteAccount is defined here
import '../styles/Profile.css'

export default function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const profileData = await authAPI.getProfile()
        setUser(profileData)
        setFormData(profileData)
      } catch (err) {
        console.warn('Backend profile not available, using localStorage:', err)
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          setUser(userData)
          setFormData(userData)
        } else {
          setError('No user data found. Please log in again.')
        }
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  // HELPER: Clear all local session data
  const clearLocalSession = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('cart')
  }

  const handleLogout = () => {
    // For JWT, we simply destroy the token on the client side
    clearLocalSession()
    navigate('/login')
  }

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete your account? This will also remove all your products and categories. This action cannot be undone.'
    )

    if (confirmDelete) {
      try {
        // 1. Call the backend to delete the user and cascade-delete their data
        await authAPI.deleteAccount() 
        navigate('/Login')
        // 2. Clean up local storage
        clearLocalSession()
        
        alert('Account deleted successfully.')

        
      } catch (err) {
        console.error('Error deleting account:', err)
        alert(err.response?.data?.error || 'Failed to delete account. Please try again.')
      }
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    try {
      // If you have a profile update API, call it here:
      // await authAPI.updateProfile(formData)
      localStorage.setItem('user', JSON.stringify(formData))
      setUser(formData)
      setIsEditing(false)
    } catch (err) {
      console.error('Error updating profile:', err)
    }
  }

  const handleCancel = () => {
    setFormData(user)
    setIsEditing(false)
  }

  if (loading) return <div className="buyer-page"><Navbar active="Profile" /><div className="loading-state">Loading profile...</div></div>
  if (error) return <div className="buyer-page"><Navbar active="Profile" /><div className="error-state">{error}</div></div>

  const getInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <div className="buyer-page">
      <Navbar />
      <main className="profile-main">
        <div className="profile-header">
          <div className="profile-card">
            <div className="avatar-section">
              <div className="avatar-circle">{getInitials(user?.name)}</div>
              <div className="profile-info">
                <h1>{user?.name}</h1>
                <p className="profile-email">{user?.email}</p>
              </div>
            </div>
            <button className="edit-profile-btn" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          </div>
        </div>

        <div className="profile-content">
          <aside className="profile-sidebar">
            <nav className="profile-nav">
              <button className="profile-nav-item active">
                <span className="nav-icon">👤</span>
                <span>Personal Info</span>
              </button>
              <button className="profile-nav-item">
                <span className="nav-icon">🔔</span>
                <span>Notifications</span>
              </button>
            </nav>
          </aside>

          <section className="profile-section">
            <h2>Personal Information</h2>
            <div className="info-grid">
              <div className="info-field">
                <label>Full Name</label>
                <input type="text" name="name" value={formData?.name || ''} onChange={handleInputChange} readOnly={!isEditing} />
              </div>
              <div className="info-field">
                <label>Email Address</label>
                <input type="email" name="email" value={formData?.email || ''} onChange={handleInputChange} readOnly={!isEditing} />
              </div>
              <div className="info-field">
                <label>Phone Number</label>
                <input type="tel" name="phone" value={formData?.phone || ''} onChange={handleInputChange} readOnly={!isEditing} />
              </div>
              <div className="info-field">
                <label>Member Since</label>
                <input type="text" value="January 2024" readOnly />
              </div>
            </div>

            <div className="profile-actions">
              {isEditing ? (
                <>
                  <button className="primary-btn" onClick={handleSave}>Save Changes</button>
                  <button className="secondary-btn" onClick={handleCancel}>Cancel</button>
                </>
              ) : (
                <>
                  <button className="primary-btn" onClick={() => setIsEditing(true)}>Update Information</button>
                  <button className="secondary-btn">Change Password</button>
                </>
              )}
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
              <button className="logout-btn" onClick={handleDeleteAccount}>Delete Account</button>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}