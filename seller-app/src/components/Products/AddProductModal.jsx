import { useState, useEffect } from 'react'
import { productService } from '../../services/productService'
import Button from '../Common/Button'
import Input from '../Common/Input'
import './Modal.css'

export default function AddProductModal({ onClose, editingProduct }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: ''
  })
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCategories()
    if (editingProduct) {
      setFormData({
        title: editingProduct.title,
        description: editingProduct.description,
        price: editingProduct.price,
        category: editingProduct.category?._id || ''
      })
    }
  }, [editingProduct])

  const fetchCategories = async () => {
    try {
      const response = await productService.getCategories()
      setCategories(response.data)
    } catch (err) {
      console.error('Failed to load categories')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct._id, formData)
      } else {
        await productService.createProduct(
          formData.title,
          formData.description,
          parseFloat(formData.price),
          formData.category
        )
      }
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal__body">
          {error && <div className="modal__error">{error}</div>}

          <Input 
            label="Product Title"
            placeholder="Enter product title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />

          <Input 
            label="Description"
            placeholder="Enter product description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />

          <Input 
            label="Price"
            type="number"
            placeholder="0.00"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            required
          />

          <div className="input-group">
            <label className="input-group__label">Category</label>
            <select 
              className="input"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="modal__footer">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Saving...' : (editingProduct ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
