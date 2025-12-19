import { useState, useEffect } from 'react'
import apiClient from '../services/api'
import './Flags.css'

export default function Flags() {
  const [flags, setFlags] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all') // all, resolved, unresolved

  useEffect(() => {
    loadFlags()
  }, [])

  const loadFlags = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await apiClient.get('/seller/flags')
      setFlags(response.data)
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load flags')
    } finally {
      setLoading(false)
    }
  }

  const handleResolveFlag = async (flagId) => {
    if (!window.confirm('Mark this flag as resolved? This indicates you have addressed the issue.')) {
      return
    }

    try {
      await apiClient.patch(`/seller/flags/${flagId}/resolve`)
      // Update local state
      setFlags(flags.map(f => f._id === flagId ? { ...f, resolved: true } : f))
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to resolve flag')
    }
  }

  const handleDeleteFlag = async (flagId) => {
    if (!window.confirm('Are you sure you want to delete this flag? This action cannot be undone.')) {
      return
    }

    try {
      await apiClient.delete(`/seller/flags/${flagId}`)
      // Remove from local state
      setFlags(flags.filter(f => f._id !== flagId))
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to delete flag')
    }
  }

  const filteredFlags = flags.filter(flag => {
    if (filter === 'resolved') return flag.resolved
    if (filter === 'unresolved') return !flag.resolved
    return true
  })

  const unresolvedCount = flags.filter(f => !f.resolved).length

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    })
  }

  if (loading) {
    return (
      <div className="flags-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading flags...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flags-page">
      <div className="flags-header">
        <div className="header-left">
          <h1>Flags & Reports</h1>
          <p className="flags-subtitle">Review reports made against your account</p>
          {unresolvedCount > 0 && (
            <span className="unresolved-badge">
              {unresolvedCount} unresolved
            </span>
          )}
        </div>
        <div className="header-actions">
          <button className="refresh-btn" onClick={loadFlags} disabled={loading}>
            {loading ? '🔄 Refreshing...' : '🔄 Refresh'}
          </button>
        </div>
      </div>

      {error && <div className="flags-error">{error}</div>}

      {/* Filter Tabs */}
      <div className="flag-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({flags.length})
        </button>
        <button 
          className={`filter-btn ${filter === 'unresolved' ? 'active' : ''}`}
          onClick={() => setFilter('unresolved')}
        >
          Unresolved ({unresolvedCount})
        </button>
        <button 
          className={`filter-btn ${filter === 'resolved' ? 'active' : ''}`}
          onClick={() => setFilter('resolved')}
        >
          Resolved ({flags.length - unresolvedCount})
        </button>
      </div>

      {/* Flags List */}
      {filteredFlags.length === 0 ? (
        <div className="empty-flags">
          <div className="empty-icon">🚩</div>
          <h3>No flags found</h3>
          <p>
            {filter === 'unresolved' 
              ? "Great! You have no unresolved flags." 
              : filter === 'resolved'
              ? "No resolved flags yet."
              : "You have not been flagged by any buyers. Keep up the good work!"}
          </p>
        </div>
      ) : (
        <div className="flags-container">
          {filteredFlags.map(flag => (
            <div 
              key={flag._id} 
              className={`flag-card ${flag.resolved ? 'resolved' : 'unresolved'}`}
            >
              <div className="flag-header">
                <div className="flag-icon">
                  {flag.resolved ? '✅' : '🚩'}
                </div>
                <div className="flag-info">
                  <h3 className="flag-title">
                    {flag.resolved ? 'Resolved Flag' : 'Active Flag'}
                  </h3>
                  <p className="flag-reporter">
                    Reported by: <strong>{flag.reporter?.name || 'Anonymous'}</strong>
                    {flag.reporter?.email && (
                      <span className="reporter-email"> ({flag.reporter.email})</span>
                    )}
                  </p>
                  <span className="flag-time">{formatDate(flag.createdAt)}</span>
                </div>
                <div className="flag-status">
                  <span className={`status-badge ${flag.resolved ? 'resolved' : 'active'}`}>
                    {flag.resolved ? 'Resolved' : 'Active'}
                  </span>
                </div>
              </div>
              
              <div className="flag-content">
                <h4>Reason:</h4>
                <p className="flag-reason">{flag.reason}</p>
              </div>

              <div className="flag-actions-buttons">
                {!flag.resolved && (
                  <button 
                    className="btn-resolve"
                    onClick={() => handleResolveFlag(flag._id)}
                  >
                    ✓ Mark as Resolved
                  </button>
                )}
                <button 
                  className="btn-delete"
                  onClick={() => handleDeleteFlag(flag._id)}
                >
                  🗑️ Delete
                </button>
              </div>

              {!flag.resolved && (
                <div className="flag-actions">
                  <p className="action-note">
                    ⚠️ This flag is under review. Please ensure your listings and transactions comply with our policies.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Info Section */}
      {flags.length > 0 && (
        <div className="flags-info-section">
          <h3>About Flags</h3>
          <div className="info-cards">
            <div className="info-card">
              <div className="info-icon">📋</div>
              <h4>What are flags?</h4>
              <p>Flags are reports made by buyers when they experience issues with your products or services.</p>
            </div>
            <div className="info-card">
              <div className="info-icon">🔍</div>
              <h4>What happens next?</h4>
              <p>Our team reviews all flags. Maintain good practices to avoid account restrictions.</p>
            </div>
            <div className="info-card">
              <div className="info-icon">✨</div>
              <h4>How to prevent flags?</h4>
              <p>Provide accurate product descriptions, respond promptly to customers, and maintain quality standards.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
