import '../styles/ProductCard.css'

export default function ProductCard({ product }) {
  // Handle both backend (title) and frontend (name) field names
  const productName = product.title || product.name || 'Product'
  const productImage = product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80'
  const categoryName = product.category?.name || product.category || 'General'
  
  const handleAddToCart = () => {
    // Get current cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    
    // Create order item
    const orderItem = {
      id: product._id || product.id,
      name: productName,
      price: product.price,
      qty: 1,
      image: productImage,
      category: categoryName,
      status: 'pending',
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    }
    
    // Check if product already in cart, if so increase qty
    const existingItem = cart.find(item => item.id === orderItem.id)
    if (existingItem) {
      existingItem.qty += 1
    } else {
      cart.push(orderItem)
    }
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart))
    alert('✅ Added to cart!')
  }
  
  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <img src={productImage} alt={productName} loading="lazy" />
        {product.badge && <span className={`product-badge ${product.badgeType || 'new'}`}>{product.badge}</span>}
      </div>

      <div className="product-info">
        <div className="product-meta">
          <p className="category">{categoryName}</p>
        </div>

        <h3 className="product-name">{productName}</h3>

        <div className="product-rating">
          <div className="stars">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={`star ${i < product.rating ? 'filled' : ''}`}>
                ★
              </span>
            ))}
          </div>
          <span className="rating-text">({product.reviews})</span>
        </div>

        <div className="product-footer">
          <div className="price-section">
            <span className="price">${product.price}</span>
            {product.originalPrice && (
              <span className="original-price">${product.originalPrice}</span>
            )}
          </div>
        </div>

        <button className="add-to-cart" type="button" onClick={handleAddToCart}>
          Add to Cart
        </button>
      </div>
    </article>
  )
}
