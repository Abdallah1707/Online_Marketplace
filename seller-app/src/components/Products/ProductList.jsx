import { useState, useEffect } from 'react'
import { productService } from '../../services/productService'
import ProductCard from './ProductCard'
import AddProductModal from './AddProductModal'
import Button from '../Common/Button'
import './ProductList.css'

export default function ProductList() {
  const [products, setProducts] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingProduct, setEditingProduct] = useState(null)
  const [viewMode, setViewMode] = useState('grid') // grid or list

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await productService.getSellerProducts()
      setProducts(response.data)
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
          <Button variant="secondary" icon="🔍">
            Filter
          </Button>
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

      {products.length === 0 ? (
        <div className="empty-state">
          <p>No products yet. Click "Add Product" to get started!</p>
        </div>
      ) : (
        <div className={`product-list__grid ${viewMode}`}>
          {products.map(product => (
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
          onClose={handleModalClose}
          editingProduct={editingProduct}
        />
      )}
    </div>
  )
}
