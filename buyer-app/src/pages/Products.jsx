import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import ProductCard from '../components/ProductCard'
import { publicAPI } from '../services/api'
import '../styles/Catalog.css'

export default function Products() {
  const location = useLocation()
  const navigate = useNavigate()
  const [view, setView] = useState('grid') // 'grid' | 'compact' | 'list'
  const [sort, setSort] = useState('popularity')
  const [showFilters, setShowFilters] = useState(false)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    categories: new Set(),
    priceMin: '',
    priceMax: '',
    badge: 'any', // any | sale | best | new
    ratingMin: 'any', // any | 4 | 5
  })

  const searchParams = new URLSearchParams(location.search)
  const q = searchParams.get('q')?.trim().toLowerCase() || ''

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const data = await publicAPI.getProducts()
        const fetchedProducts = Array.isArray(data) ? data : (data.products || [])
        
        console.log('✅ Loaded', fetchedProducts.length, 'products from backend')
        setProducts(fetchedProducts)
        setError(null)
      } catch (err) {
        console.error('❌ Failed to fetch products:', err)
        setError(err.message)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const toggleCategory = (cat) => {
    setFilters((prev) => {
      const next = new Set(prev.categories)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return { ...prev, categories: next }
    })
  }

  const updateFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }))

  const filtered = products.filter((p) => {
    // Category filter
    if (filters.categories.size && !filters.categories.has(p.category)) return false
    // Price filter
    if (filters.priceMin !== '' && p.price < Number(filters.priceMin)) return false
    if (filters.priceMax !== '' && p.price > Number(filters.priceMax)) return false
    // Badge filter
    if (filters.badge !== 'any') {
      if ((p.badgeType || 'none') !== filters.badge) return false
    }
    // Search by query param
    if (q) {
      if (!p.name.toLowerCase().includes(q)) return false
    }
    // Minimum rating
    if (filters.ratingMin !== 'any') {
      if ((p.rating ?? 0) < Number(filters.ratingMin)) return false
    }
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    switch (sort) {
      case 'price-asc':
        return a.price - b.price
      case 'price-desc':
        return b.price - a.price
      case 'newest':
        // No date in demo data; approximate by id desc
        return b.id - a.id
      case 'rating':
        return (b.rating ?? 0) - (a.rating ?? 0)
      case 'popularity':
      default:
        return (b.reviews ?? 0) - (a.reviews ?? 0)
    }
  })
  return (
    <div className="buyer-page">
      <Navbar active="Products" />

      <main className="catalog-main">
        <div className="catalog-header">
          <div className="header-content">
            <h1>Discover Products</h1>
            <p className="header-subtitle">
              Browse our curated collection and find exactly what you need.
            </p>
          </div>

          <div className="catalog-controls">
            <div className="sort-dropdown">
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="popularity">Sort by: Popularity</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest</option>
                <option value="rating">Rating</option>
              </select>
              <span className="chevron">›</span>
            </div>

            <button className="filter-btn" type="button" onClick={() => setShowFilters((s) => !s)}>
              {showFilters ? 'Hide Filters' : 'Filter'}
            </button>

            <div className="view-toggle" role="group" aria-label="Choose view mode">
              <button
                className={`view-opt ${view === 'grid' ? 'active' : ''}`}
                aria-label="Grid view"
                title="Grid view"
                type="button"
                onClick={() => setView('grid')}
              >
                <span className="view-icon" aria-hidden>⊞</span>
                <span className="view-label">Grid</span>
              </button>
              <button
                className={`view-opt ${view === 'compact' ? 'active' : ''}`}
                aria-label="Compact grid"
                title="Compact grid"
                type="button"
                onClick={() => setView('compact')}
              >
                <span className="view-icon" aria-hidden>◼</span>
                <span className="view-label">Compact</span>
              </button>
              <button
                className={`view-opt ${view === 'list' ? 'active' : ''}`}
                aria-label="List view"
                title="List view"
                type="button"
                onClick={() => setView('list')}
              >
                <span className="view-icon" aria-hidden>☰</span>
                <span className="view-label">List</span>
              </button>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="filters-panel">
            <div className="filter-row">
              <select
                className="rating-select"
                value={filters.ratingMin}
                onChange={(e) => updateFilter('ratingMin', e.target.value)}
                title="Minimum rating"
              >
                <option value="any">Any rating</option>
                <option value="4">4★ and up</option>
                <option value="5">5★ only</option>
              </select>
              <button
                type="button"
                className="reset-btn"
                onClick={() =>
                  setFilters({
                    categories: new Set(),
                    priceMin: '',
                    priceMax: '',
                    badge: 'any',
                    ratingMin: 'any',
                  })
                }
              >
                Reset
              </button>
            </div>
            <div className="filter-group">
              <span className="filter-label">Category</span>
              {['Smartphones', 'Tablets', 'Laptops', 'Audio', 'Accessories'].map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`chip ${filters.categories.has(c) ? 'active' : ''}`}
                  onClick={() => toggleCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="filter-group">
              <span className="filter-label">Price</span>
              <input
                className="price-input"
                type="number"
                min="0"
                placeholder="Min"
                value={filters.priceMin}
                onChange={(e) => updateFilter('priceMin', e.target.value)}
              />
              <span className="dash">—</span>
              <input
                className="price-input"
                type="number"
                min="0"
                placeholder="Max"
                value={filters.priceMax}
                onChange={(e) => updateFilter('priceMax', e.target.value)}
              />
            </div>
            <div className="filter-group">
              <span className="filter-label">Badge</span>
              <select
                className="badge-select"
                value={filters.badge}
                onChange={(e) => updateFilter('badge', e.target.value)}
              >
                <option value="any">Any</option>
                <option value="sale">On Sale</option>
                <option value="best">Best Seller</option>
                <option value="new">New</option>
              </select>
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading-state">
            <p>Loading products...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>Error: {error}</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="empty-state">
            <p>No products available.</p>
          </div>
        ) : null}

        <section className={`product-grid ${view}`}>
          {sorted.map((product) => (
            <ProductCard key={product.id || product._id} product={product} />
          ))}
        </section>
      </main>
    </div>
  )
}
