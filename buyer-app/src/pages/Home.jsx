import { Link } from 'react-router-dom'
import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { publicAPI } from '../services/api'
import '../styles/Home.css'

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const data = await publicAPI.getProducts()
        const products = Array.isArray(data) ? data : (data.products || [])
        const withRatings = products.map(p => ({
          ...p,
          rating: typeof p.rating === 'number' ? p.rating : 0,
        }))
        const top4 = withRatings.sort((a,b) => (b.rating||0) - (a.rating||0)).slice(0,4)
        setFeatured(top4)
        setError('')
      } catch (e) {
        setError(e.message || 'Failed to load featured products')
        setFeatured([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])
  return (
    <div className="buyer-page">
      <Navbar />

      <main className="home-main">
        <section className="hero">
          <div className="hero-content">
            <h1>Welcome to Sellora</h1>
            <p>Discover thousands of products at unbeatable prices.</p>
            <Link to="/products" className="hero-cta">
              Start Shopping
            </Link>
          </div>
        </section>

        <section className="featured-section">
          <div className="section-header">
            <h2>Featured Products</h2>
            <Link to="/products" className="view-all">
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="loading-state"><p>Loading featured...</p></div>
          ) : error ? (
            <div className="error-state"><p>{error}</p></div>
          ) : (
            <div className="product-preview-grid">
              {featured.map((p) => (
                <div key={p._id || p.id} className="preview-card">
                  <div className="preview-image" style={{ backgroundImage: `url(${p.image || ''})` }} />
                  <h3>{p.title || p.name}</h3>
                  <p className="price">${p.price}</p>
                  <div className="rating-row">⭐ {p.rating ?? 0}</div>
                  <Link className="preview-cta" to="/products">
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="categories-section">
          <h2>Shop by Category</h2>
          <div className="categories-grid">
            {[
              { name: 'Electronics', icon: '📱' },
              { name: 'Computers', icon: '💻' },
              { name: 'Audio', icon: '🎧' },
              { name: 'Accessories', icon: '🎒' },
            ].map((cat) => (
              <div key={cat.name} className="category-card">
                <div className="category-icon">{cat.icon}</div>
                <h3>{cat.name}</h3>
                <a href="#">Browse →</a>
              </div>
            ))}
          </div>
        </section>

        {/* Promo section removed as requested */}
      </main>
    </div>
  )
}
