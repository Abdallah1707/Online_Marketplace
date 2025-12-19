import { useState, useEffect, useMemo } from 'react'
import { productService } from '../../services/productService'
import { categoryService } from '../../services/categoryService'
import ProductCard from './ProductCard'
import AddProductModal from './AddProductModal'
import Button from '../Common/Button'
import './ProductList.css'

export default function ProductList() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingProduct, setEditingProduct] = useState(null)
  const [viewMode, setViewMode] = useState('grid') // grid or list

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const data = await categoryService.list()
      setCategories(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load categories:', err)
    }
  }

  const fetchProducts = async () => {
    try {
      console.log("DEBUG: fetching seller products");

      setLoading(true)
      const data = await productService.getSellerProducts()
      setProducts(data)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(id)
        setProducts(products.filter(p => p._id !== id))
      } catch (err) {
        alert('Failed to delete product')
      }
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setShowModal(true)
  }

  const handleAddNew = () => {
    setEditingProduct(null)
    setShowModal(true)
  }

  const handleModalClose = () => {
    setShowModal(false)
    setEditingProduct(null)
    fetchProducts()
  }

  const handleCategoryFilter = (categoryId) => {
    setSelectedCategory(categoryId)
    setShowFilterDropdown(false)
  }

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return products
    return products.filter(product => {
      const productCategoryId = product.category?._id || product.category
      return productCategoryId === selectedCategory
    })
  }, [products, selectedCategory])

  if (loading) return <div className="loading">Loading products...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="product-list">
      <div className="product-list__header">
        <div className="product-list__title-section">
          <h1 className="product-list__title">Product List</h1>
          <p className="product-list__subtitle">Track stock levels, availability, and restocking needs in real time.</p>
        </div>

        <div className="product-list__controls">
          <Button variant="primary" onClick={handleAddNew} icon="➕">
            Add Product
          </Button>
          <div className="filter-container">
            <Button 
              variant="secondary" 
              icon="🔍" 
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            >
              Filter {selectedCategory && '(1)'}
            </Button>
            {showFilterDropdown && (
              <div className="filter-dropdown">
                <div className="filter-dropdown__header">
                  <span>Filter by Category</span>
                  {selectedCategory && (
                    <button 
                      className="clear-filter-btn"
                      onClick={() => handleCategoryFilter('')}
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="filter-dropdown__options">
                  <button
                    className={`filter-option ${!selectedCategory ? 'active' : ''}`}
                    onClick={() => handleCategoryFilter('')}
                  >
                    All Categories
                  </button>
                  {categories.map(category => (
                    <button
                      key={category._id}
                      className={`filter-option ${selectedCategory === category._id ? 'active' : ''}`}
                      onClick={() => handleCategoryFilter(category._id)}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="product-list__view-toggle">
            <button 
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              ⊞
            </button>
            <button 
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="empty-state">
          <p>{selectedCategory ? 'No products in this category.' : 'No products yet. Click "Add Product" to get started!'}</p>
        </div>
      ) : (
        <div className={`product-list__grid ${viewMode}`}>
          {filteredProducts.map(product => (
            <ProductCard 
              key={product._id} 
              product={product}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showModal && (
        <AddProductModal 
          open={showModal}
          onClose={handleModalClose}
          editingProduct={editingProduct}
          onCreated={fetchProducts}
        />
      )}
    </div>
  )
}
