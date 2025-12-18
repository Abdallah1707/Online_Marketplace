import { useState } from 'react'
import './Notifications.css'

export default function Notifications() {
  const [filter, setFilter] = useState('all') // all, unread, read
  
  // Mock notifications - in real app, fetch from backend
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'order',
      title: 'New Order Received',
      message: 'You have received a new order #1234 from John Smith',
      time: '5 minutes ago',
      date: new Date(Date.now() - 5 * 60 * 1000),
      unread: true,
      icon: '🛒',
    },
    {
      id: 2,
      type: 'product',
      title: 'Product Updated',
      message: 'iPhone 15 Pro stock has been updated successfully',
      time: '1 hour ago',
      date: new Date(Date.now() - 60 * 60 * 1000),
      unread: true,
      icon: '📦',
    },
    {
      id: 3,
      type: 'warning',
      title: 'Low Stock Alert',
      message: 'MacBook Pro 14-inch is running low on stock (only 2 left)',
      time: '2 hours ago',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000),
      unread: false,
      icon: '⚠️',
    },
    {
      id: 4,
      type: 'order',
      title: 'Order Shipped',
      message: 'Order #1230 has been marked as shipped',
      time: '3 hours ago',
      date: new Date(Date.now() - 3 * 60 * 60 * 1000),
      unread: false,
      icon: '📦',
    },
    {
      id: 5,
      type: 'review',
      title: 'New Review',
      message: 'Customer left a 5-star review on AirPods Pro',
      time: '5 hours ago',
      date: new Date(Date.now() - 5 * 60 * 60 * 1000),
      unread: false,
      icon: '⭐',
    },
    {
      id: 6,
      type: 'system',
      title: 'System Update',
      message: 'New features have been added to your seller dashboard',
      time: '1 day ago',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000),
      unread: false,
      icon: '🔔',
    },
    {
      id: 7,
      type: 'order',
      title: 'Payment Received',
      message: 'Payment of $999 received for order #1228',
      time: '1 day ago',
      date: new Date(Date.now() - 26 * 60 * 60 * 1000),
      unread: false,
      icon: '💰',
    },
    {
      id: 8,
      type: 'product',
      title: 'Product Approved',
      message: 'Your product "Samsung Galaxy S24" has been approved',
      time: '2 days ago',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      unread: false,
      icon: '✅',
    },
  ])

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return notif.unread
    if (filter === 'read') return !notif.unread
    return true
  })

  const unreadCount = notifications.filter(n => n.unread).length

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, unread: false } : notif
    ))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, unread: false })))
  }

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(notif => notif.id !== id))
  }

  const clearAll = () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      setNotifications([])
    }
  }

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div className="header-left">
          <h1>Notifications</h1>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount} unread</span>
          )}
        </div>
        <div className="header-actions">
          {unreadCount > 0 && (
            <button className="btn btn-secondary" onClick={markAllAsRead}>
              Mark all as read
            </button>
          )}
          {notifications.length > 0 && (
            <button className="btn btn-danger" onClick={clearAll}>
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="notification-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({notifications.length})
        </button>
        <button 
          className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
          onClick={() => setFilter('unread')}
        >
          Unread ({unreadCount})
        </button>
        <button 
          className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
          onClick={() => setFilter('read')}
        >
          Read ({notifications.length - unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="notifications-container">
        {filteredNotifications.length === 0 ? (
          <div className="empty-notifications">
            <div className="empty-icon">🔔</div>
            <h3>No notifications</h3>
            <p>
              {filter === 'unread' 
                ? "You're all caught up! No unread notifications." 
                : filter === 'read'
                ? "No read notifications yet."
                : "You have no notifications at this time."}
            </p>
          </div>
        ) : (
          <div className="notifications-list">
            {filteredNotifications.map(notif => (
              <div 
                key={notif.id} 
                className={`notification-card ${notif.unread ? 'unread' : ''}`}
                onClick={() => notif.unread && markAsRead(notif.id)}
              >
                <div className="notification-icon">{notif.icon}</div>
                <div className="notification-content">
                  <div className="notification-header-row">
                    <h3>{notif.title}</h3>
                    {notif.unread && <div className="unread-dot"></div>}
                  </div>
                  <p>{notif.message}</p>
                  <span className="notification-time">{notif.time}</span>
                </div>
                <div className="notification-actions">
                  {notif.unread && (
                    <button 
                      className="action-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        markAsRead(notif.id)
                      }}
                      title="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                  <button 
                    className="action-btn delete-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteNotification(notif.id)
                    }}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
