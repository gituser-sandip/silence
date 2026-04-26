import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';

// Theme Context
const ThemeContext = React.createContext();

function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('theme', JSON.stringify(isDark));
    document.body.className = isDark ? 'dark-theme' : 'light-theme';
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Rating Stars Component
function RatingStars({ rating }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i} className={`star ${i <= Math.floor(rating) ? 'filled' : ''}`}>
        ★
      </span>
    );
  }
  return <div className="rating-stars">{stars}</div>;
}

// Navbar Component
function Navbar() {
  const { isDark, setIsDark } = useContext(ThemeContext);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <Link to="/" className="logo">
          <span className="logo-main">SILENCE</span>
          <span className="logo-sub">PERFUMES</span>
        </Link>

        <div className={`nav-links ${mobileMenu ? 'active' : ''}`}>
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            Home
          </Link>
          <Link to="/collections" className={`nav-link ${location.pathname === '/collections' ? 'active' : ''}`}>
            Collections
          </Link>
          <Link to="/about" className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}>
            Our Story
          </Link>
          <Link to="/contact" className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}>
            Contact
          </Link>
        </div>

        <div className="nav-actions">
          <button className="theme-toggle" onClick={() => setIsDark(!isDark)}>
            {isDark ? '☀️' : '🌙'}
          </button>
          <button className="cart-btn">
            <span className="cart-icon">🛍️</span>
            <span className="cart-count">0</span>
          </button>
          <button className={`hamburger ${mobileMenu ? 'active' : ''}`} onClick={() => setMobileMenu(!mobileMenu)}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </nav>
  );
}

// Product Card Component
function ProductCard({ product, detailed }) {
  const getCategoryIcon = (category) => {
    const icons = {
      oriental: '🌙',
      floral: '🌸',
      woody: '🌲',
      fresh: '🍋',
      leather: '👜'
    };
    return icons[category] || '💎';
  };

  return (
    <div className={`product-card ${detailed ? 'detailed' : ''}`}>
      <div className="product-image-wrapper">
        <div className="product-image">
          <div className="image-accent"></div>
          <span className="product-initial">{getCategoryIcon(product.category)}</span>
          <span className="product-category-badge">{product.category}</span>
        </div>
        <div className="product-overlay">
          <Link to={`/product/${product.id}`} className="overlay-link">
            Discover
          </Link>
        </div>
      </div>
      <div className="product-info">
        <div className="product-header">
          <span className="product-category-label">{product.category}</span>
          <RatingStars rating={product.rating} />
        </div>
        <h3>{product.name}</h3>
        <p className="product-notes">{product.notes}</p>
        {detailed && (
          <div className="product-details-mini">
            <div className="detail-item">
              <span className="detail-label">Longevity</span>
              <span className="detail-value">{product.longevity}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Season</span>
              <span className="detail-value">{product.season}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Time</span>
              <span className="detail-value">{product.timeOfDay}</span>
            </div>
          </div>
        )}
        <div className="product-footer">
          <span className="product-price">${product.price}</span>
          <button className="add-to-cart-btn">
            <span>+</span> Add
          </button>
        </div>
        <div className="product-reviews">
          <span className="review-count">{product.reviews} reviews</span>
        </div>
      </div>
    </div>
  );
}

// Home Page
function Home() {
  const { isDark } = useContext(ThemeContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data.slice(0, 4));
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-text-wrapper">
            <span className="hero-label">LUXURY FRAGRANCES</span>
            <h1 className="hero-title">
              <span className="title-line">The Art of</span>
              <span className="title-line accent">Silence</span>
            </h1>
            <p className="hero-description">
              Discover fragrances that speak volumes through their quiet elegance. 
              Each scent tells a story of sophistication and mystery.
            </p>
            <div className="hero-buttons">
              <Link to="/collections" className="btn-primary">
                Explore Collection <span className="btn-arrow">→</span>
              </Link>
              <Link to="/about" className="btn-secondary">
                Our Story
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="floating-bottle">
              <div className="bottle-shape"></div>
              <div className="bottle-sparkle sparkle-1"></div>
              <div className="bottle-sparkle sparkle-2"></div>
              <div className="bottle-sparkle sparkle-3"></div>
            </div>
          </div>
        </div>
        <div className="scroll-indicator">
          <span>Scroll to discover</span>
          <div className="scroll-line"></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-number">12</span>
            <span className="stat-label">Signature Scents</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">200+</span>
            <span className="stat-label">Rare Ingredients</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">100%</span>
            <span className="stat-label">Natural Essences</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">4.8</span>
            <span className="stat-label">Average Rating</span>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-section">
        <div className="section-header">
          <span className="section-label">Curated Selection</span>
          <h2>Best Sellers</h2>
          <p>Our most beloved fragrances, crafted for the connoisseur</p>
        </div>

        {loading ? (
          <div className="loading-spinner"><div className="spinner"></div></div>
        ) : (
          <div className="products-showcase">
            {products.map((product, index) => (
              <div key={product.id} className="product-showcase-card" style={{ animationDelay: `${index * 0.15}s` }}>
                <ProductCard product={product} detailed={true} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Categories Section */}
      <section className="philosophy-section">
        <div className="philosophy-content">
          <div className="philosophy-text">
            <span className="section-label">Our Philosophy</span>
            <h2>Mystery in Every Drop</h2>
            <blockquote className="philosophy-quote">
              "We believe that true luxury is about not needing to shout. 
              It is the quiet presence that lingers long after the conversation has ended."
            </blockquote>
            <p className="philosophy-description">
              Each fragrance is a distillation of beauty, crafted by master perfumers using rare 
              and timeless materials. We do not follow trends; we capture moments of profound stillness.
            </p>
            <Link to="/about" className="btn-outline">
              Learn Our Heritage
            </Link>
          </div>
          <div className="philosophy-visual">
            <div className="philosophy-pattern"></div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter-section">
        <div className="newsletter-content">
          <h2>Join the Silence</h2>
          <p>Subscribe for exclusive offers and fragrance stories</p>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Your email address" />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </section>
    </div>
  );
}

// Collections Page
function Collections() {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const url = filter === 'all' 
      ? '/api/products' 
      : `/api/products?category=${filter}`;
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setLoading(false);
      });
  }, [filter]);

  const categories = ['all', 'oriental', 'floral', 'woody', 'fresh', 'leather'];
  
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.notes.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="collections-page">
      <div className="page-hero">
        <h1>Our Collections</h1>
        <p>Discover the perfect scent for every moment</p>
      </div>

      <div className="collections-container">
        <div className="filter-section">
          <div className="filter-bar">
            {categories.map(cat => (
              <button
                key={cat}
                className={`filter-btn ${filter === cat ? 'active' : ''}`}
                onClick={() => setFilter(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
          
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search fragrances..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner"><div className="spinner"></div></div>
        ) : (
          <div className="collections-grid">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} detailed={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Product Detail Page
function ProductDetail() {
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const id = window.location.pathname.split('/').pop();

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(data => setProduct(data))
      .catch(err => console.error('Error:', err));
  }, [id]);

  if (!product) {
    return (
      <div className="loading-spinner"><div className="spinner"></div></div>
    );
  }

  return (
    <div className="product-detail-page">
      <div className="product-detail-container">
        <div className="product-detail-image">
          <div className="detail-image-content">
            <span className="detail-initial">
              {product.category === 'oriental' ? '🌙' :
               product.category === 'floral' ? '🌸' :
               product.category === 'woody' ? '🌲' :
               product.category === 'fresh' ? '🍋' : '💎'}
            </span>
          </div>
        </div>

        <div className="product-detail-info">
          <div className="detail-breadcrumb">
            <Link to="/collections">Collections</Link> / <span>{product.category}</span>
          </div>
          
          <span className="detail-category">{product.category}</span>
          <h1>{product.name}</h1>
          
          <div className="detail-rating">
            <RatingStars rating={product.rating} />
            <span className="detail-reviews">({product.reviews} reviews)</span>
          </div>
          
          <p className="detail-price">${product.price}</p>
          <p className="detail-description">{product.description}</p>
          
          <div className="detail-reference">
            <span className="ref-label">Inspiration</span>
            <p>{product.reference}</p>
          </div>
          
          <div className="detail-notes">
            <h3>Fragrance Notes</h3>
            <div className="notes-breakdown">
              {product.notes.split(' | ').map((note, index) => (
                <div key={index} className="note-group">
                  <span className="note-label">
                    {index === 0 ? 'Top' : index === 1 ? 'Heart' : 'Base'} Notes
                  </span>
                  <p>{note.split(': ')[1]}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="detail-specs">
            <div className="spec-item">
              <span className="spec-label">Size</span>
              <span className="spec-value">{product.size}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Concentration</span>
              <span className="spec-value">{product.concentration}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Longevity</span>
              <span className="spec-value">{product.longevity}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Season</span>
              <span className="spec-value">{product.season}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Best Time</span>
              <span className="spec-value">{product.timeOfDay}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Gender</span>
              <span className="spec-value">{product.gender}</span>
            </div>
          </div>

          <div className="detail-actions">
            <div className="quantity-selector">
              <button onClick={() => quantity > 1 && setQuantity(quantity - 1)}>−</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
            <button className="btn-primary add-to-cart-large">
              Add to Cart — ${(product.price * quantity).toFixed(2)}
            </button>
          </div>

          <div className="detail-features">
            <div className="feature">
              <span className="feature-icon">🚚</span>
              <span>Free Shipping over $150</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🔄</span>
              <span>30-Day Returns</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🎁</span>
              <span>Complimentary Sample</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Keep the About, Contact, and Footer components the same as before...

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/collections" element={<Collections />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              {/* Add other routes as needed */}
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;