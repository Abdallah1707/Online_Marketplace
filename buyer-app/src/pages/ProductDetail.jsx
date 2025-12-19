import Navbar from '../components/Navbar'
import '../styles/ProductDetail.css'

export default function ProductDetail() {
  const product = {
    id: 1,
    name: 'Apple iPad (Gen 10)',
    category: 'Tablets',
    price: 329,
    originalPrice: 399,
    rating: 4.8,
    reviews: 1248,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1586968425264-3f7b2e8cf0a4?auto=format&fit=crop&w=800&q=80',
    description:
      'Experience stunning visuals on the 10.9-inch Liquid Retina display. Powerful A14 Bionic chip handles everything you throw at it. Perfect for work, creativity, and entertainment.',
    specs: [
      { label: 'Storage', value: '64GB' },
      { label: 'Display', value: '10.9-inch Liquid Retina' },
      { label: 'Processor', value: 'A14 Bionic' },
      { label: 'Camera', value: '12MP + 12MP' },
    ],
    reviews_data: [
      {
        author: 'Sarah M.',
        rating: 5,
        text: 'Amazing tablet for the price. Great display and performance.',
      },
      {
        author: 'John D.',
        rating: 4,
        text: 'Very happy with my purchase. Battery life is excellent.',
      },
    ],
  }

  return (
    <div className="buyer-page">
      <Navbar />

      <main className="detail-main">
        <div className="breadcrumb">
          <a href="#">Home</a>
          <span>›</span>
          <a href="#">Tablets</a>
          <span>›</span>
          <span>{product.name}</span>
        </div>

        <div className="product-detail">
          <div className="detail-left">
            <div className="hero-image">
              <img src={product.image} alt={product.name} />
              <span className="on-sale">20% OFF</span>
            </div>

            <div className="thumbnail-gallery">
              <div className="thumbnail active">
                <img src={product.image} alt="View 1" />
              </div>
              <div className="thumbnail">
                <img src={product.image} alt="View 2" />
              </div>
              <div className="thumbnail">
                <img src={product.image} alt="View 3" />
              </div>
            </div>
          </div>

          <div className="detail-right">
            <div className="detail-header">
              <div>
                <p className="detail-category">{product.category}</p>
                <h1>{product.name}</h1>
              </div>
              <button className="wishlist-btn" type="button">
                ♡
              </button>
            </div>

            <div className="rating-section">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`star ${i < Math.floor(product.rating) ? 'filled' : ''}`}>
                    ★
                  </span>
                ))}
              </div>
              <span className="rating-score">{product.rating}</span>
              <span className="review-count">({product.reviews} reviews)</span>
            </div>

            <div className="pricing-section">
              <div className="price-group">
                <span className="current-price">${product.price}</span>
                <span className="original-price">${product.originalPrice}</span>
                <span className="discount">Save $70</span>
              </div>
              <div className="stock-status available">
                ✓ In Stock • Usually ships in 2-3 business days
              </div>
            </div>

            <div className="description-section">
              <p>{product.description}</p>
            </div>

            <div className="specs-section">
              <h3>Key Specs</h3>
              <ul className="specs-grid">
                {product.specs.map((spec, idx) => (
                  <li key={idx}>
                    <span className="spec-label">{spec.label}</span>
                    <span className="spec-value">{spec.value}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="actions-section">
              <div className="quantity-picker">
                <button type="button">−</button>
                <input type="number" value="1" min="1" />
                <button type="button">+</button>
              </div>

              <button className="add-to-cart-large" type="button">
                Add to Cart
              </button>

              <button className="buy-now" type="button">
                Buy Now
              </button>
            </div>

            <div className="trust-badges">
              <div className="badge">
                <span className="badge-icon">🛡</span>
                <span>Secure Checkout</span>
              </div>
              <div className="badge">
                <span className="badge-icon">↩</span>
                <span>30-Day Returns</span>
              </div>
              <div className="badge">
                <span className="badge-icon">⚡</span>
                <span>Fast Shipping</span>
              </div>
            </div>
          </div>
        </div>

        <section className="reviews-section">
          <h2>Customer Reviews</h2>
          <div className="reviews-list">
            {product.reviews_data.map((review, idx) => (
              <div key={idx} className="review-card">
                <div className="review-header">
                  <div>
                    <strong>{review.author}</strong>
                    <div className="review-stars">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`star ${i < review.rating ? 'filled' : ''}`}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="review-text">{review.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
