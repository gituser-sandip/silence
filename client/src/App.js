import React, { useState, useEffect } from 'react';
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

// Animated Components
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
};

// Navbar Component
function Navbar() {
  const { isDark, setIsDark } = React.useContext(ThemeContext);
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
          <button
            className="theme-toggle"
            onClick={() => setIsDark(!isDark)}
            aria-label="Toggle theme"
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          <button className="cart-btn">
            <span className="cart-icon">🛍️</span>
            <span className="cart-count">0</span>
          </button>

          <button
            className={`hamburger ${mobileMenu ? 'active' : ''}`}
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </nav>
  );
}

// Home Page
function Home() {
  const { isDark } = React.useContext(ThemeContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
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
            <span className="hero-label">NEW COLLECTION</span>
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
                Explore Collection
                <span className="btn-arrow">→</span>
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
            <span className="stat-number" data-count="15">15+</span>
            <span className="stat-label">Years of Heritage</span>
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
            <span className="stat-number">50+</span>
            <span className="stat-label">Countries</span>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-section">
        <div className="section-header">
          <span className="section-label">Curated Selection</span>
          <h2>Signature Collections</h2>
          <p>Each fragrance is a masterpiece of carefully selected notes</p>
        </div>

        {loading ? (
          <div className="loading-spinner"><div className="spinner"></div></div>
        ) : (
          <div className="products-showcase">
            {products.map((product, index) => (
              <div key={product.id} className="products-grid-item" style={{ animationDelay: `${index * 0.15}s` }}>
                <div className="product-image">
                  <span style={{ fontSize: '80px' }}>
                    {product.category === 'oriental' ? '🌙' :
                      product.category === 'floral' ? '🌸' :
                        product.category === 'woody' ? '🌲' :
                          product.category === 'fresh' ? '🍋' : '👜'}
                  </span>
                </div>
                <h3>{product.name}</h3>

                {/* Star Rating */}
                <div style={{ color: '#ffd700', marginBottom: '10px' }}>
                  {'★'.repeat(Math.floor(product.rating))}
                  {'☆'.repeat(5 - Math.floor(product.rating))}
                  <span style={{ color: '#888', fontSize: '12px', marginLeft: '5px' }}>
                    ({product.reviews})
                  </span>
                </div>

                <p className="product-notes">{product.notes}</p>
                <p className="product-price">${product.price}</p>

                {/* Quick Info */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '15px',
                  marginBottom: '15px',
                  fontSize: '12px',
                  color: '#888'
                }}>
                  <span>🕐 {product.longevity}</span>
                  <span>📅 {product.season}</span>
                </div>

                <Link to={`/product/${product.id}`} className="btn-primary">
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Philosophy Section */}
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
              Silence Perfumes was born from a desire to strip away the noise of the modern world.
              Each fragrance is a distillation of beauty, crafted by master perfumers using rare
              and timeless materials.
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

      {/* Newsletter Section */}
      <section className="newsletter-section">
        <div className="newsletter-content">
          <h2>Join the Silence</h2>
          <p>Subscribe for exclusive offers and fragrance stories</p>
          <form className="newsletter-form">
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

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setLoading(false);
      });
  }, []);

  const categories = ['all', 'signature', 'essence', 'fresh', 'oriental'];
  const filteredProducts = filter === 'all'
    ? products
    : products.filter(p => p.category === filter);

  return (
    <div className="collections-page">
      <div className="page-hero">
        <h1>Our Collections</h1>
        <p>Discover the perfect scent for every moment</p>
      </div>

      <div className="collections-container">
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

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="collections-grid">
            {filteredProducts.map(product => (
              <div key={product.id} className="collection-card">
                <div className="collection-image">
                  <span style={{ fontSize: '80px' }}>
                    {product.category === 'oriental' ? '🌙' :
                      product.category === 'floral' ? '🌸' :
                        product.category === 'woody' ? '🌲' :
                          product.category === 'fresh' ? '🍋' : '👜'}
                  </span>
                  <div className="collection-hover">
                    <Link to={`/product/${product.id}`} className="overlay-link">Discover</Link>
                  </div>
                </div>
                <div className="collection-info">
                  <span style={{
                    fontSize: '10px',
                    letterSpacing: '2px',
                    color: '#8b7355',
                    textTransform: 'uppercase'
                  }}>
                    {product.category}
                  </span>
                  <h3>{product.name}</h3>

                  {/* Star Rating */}
                  <div style={{ color: '#ffd700', marginBottom: '8px' }}>
                    {'★'.repeat(Math.floor(product.rating))}
                    {'☆'.repeat(5 - Math.floor(product.rating))}
                    <span style={{ color: '#888', fontSize: '12px', marginLeft: '5px' }}>
                      ({product.reviews})
                    </span>
                  </div>

                  <p className="collection-notes">{product.notes}</p>
                  <span className="collection-price">${product.price}</span>
                </div>
              </div>
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
  const id = window.location.pathname.split('/').pop();

  useEffect(() => {
    fetch(`http://localhost:5000/api/products/${id}`)
      .then(res => res.json())
      .then(data => setProduct(data))
      .catch(err => console.error('Error:', err));
  }, [id]);

  if (!product) {
    return <div style={{ padding: '100px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '80px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px' }}>
        {/* Product Image */}
        <div style={{
          height: '500px',
          background: '#f0eeeb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px'
        }}>
          <span style={{ fontSize: '120px' }}>
            {product.category === 'oriental' ? '🌙' :
              product.category === 'floral' ? '🌸' :
                product.category === 'woody' ? '🌲' :
                  product.category === 'fresh' ? '🍋' : '👜'}
          </span>
        </div>

        {/* Product Info */}
        <div>
          <span style={{
            fontSize: '12px',
            letterSpacing: '4px',
            color: '#8b7355',
            textTransform: 'uppercase'
          }}>
            {product.category}
          </span>

          <h1 style={{ fontSize: '36px', margin: '15px 0' }}>{product.name}</h1>

          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <span style={{ color: '#ffd700', fontSize: '18px' }}>
              {'★'.repeat(Math.floor(product.rating))}{'☆'.repeat(5 - Math.floor(product.rating))}
            </span>
            <span style={{ marginLeft: '10px', color: '#888' }}>
              {product.rating} ({product.reviews} reviews)
            </span>
          </div>

          <p style={{ fontSize: '28px', marginBottom: '20px' }}>${product.price}</p>

          <p style={{ lineHeight: '1.8', marginBottom: '20px', color: '#666' }}>
            {product.description}
          </p>

          <div style={{
            padding: '15px',
            background: '#f0eeeb',
            borderRadius: '8px',
            marginBottom: '25px',
            borderLeft: '3px solid #8b7355'
          }}>
            <p style={{ fontSize: '14px', color: '#8b7355', fontStyle: 'italic' }}>
              💡 {product.reference}
            </p>
          </div>

          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ fontSize: '14px', letterSpacing: '3px', marginBottom: '15px', textTransform: 'uppercase' }}>
              Fragrance Notes
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {product.notes.split(' | ').map((note, index) => {
                const parts = note.split(': ');
                return (
                  <div key={index} style={{
                    padding: '15px',
                    background: '#faf9f6',
                    borderRadius: '5px',
                    textAlign: 'center'
                  }}>
                    <p style={{ fontSize: '10px', color: '#8b7355', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '5px' }}>
                      {parts[0]}
                    </p>
                    <p style={{ fontSize: '13px', color: '#666' }}>
                      {parts[1]}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px',
            marginBottom: '30px'
          }}>
            <div style={{ textAlign: 'center', padding: '10px' }}>
              <p style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase' }}>Size</p>
              <p style={{ fontWeight: 'bold' }}>{product.size}</p>
            </div>
            <div style={{ textAlign: 'center', padding: '10px' }}>
              <p style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase' }}>Longevity</p>
              <p style={{ fontWeight: 'bold' }}>{product.longevity}</p>
            </div>
            <div style={{ textAlign: 'center', padding: '10px' }}>
              <p style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase' }}>Season</p>
              <p style={{ fontWeight: 'bold' }}>{product.season}</p>
            </div>
          </div>

          <button style={{
            width: '100%',
            padding: '15px',
            background: '#2c2c2c',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            letterSpacing: '2px',
            marginBottom: '20px'
          }}>
            Add to Cart — ${product.price}
          </button>

          <div style={{ display: 'flex', gap: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
            <span>🚚 Free Shipping over $150</span>
            <span>🔄 30-Day Returns</span>
            <span>🎁 Free Sample</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// About Page
function About() {
  return (
    <div className="about-page">
      <div className="page-hero about-hero">
        <h1>Our Story</h1>
        <p>The art of silence in a world of noise</p>
      </div>

      <div className="about-content">
        <div className="about-grid">
          <div className="about-text">
            <h2>The Beginning</h2>
            <p>
              Silence Perfumes was founded on a simple yet profound belief: true luxury
              doesn't need to announce itself. It whispers, it lingers, it becomes part
              of who you are.
            </p>
            <p>
              Our journey began in the heart of Grasse, France, where master perfumers
              have been crafting exceptional fragrances for centuries. We combined this
              rich heritage with a modern vision of sustainability and artistry.
            </p>
          </div>
          <div className="about-visual">
            <div className="about-pattern"></div>
          </div>
        </div>

        <div className="values-grid">
          <div className="value-card">
            <span className="value-icon">🌿</span>
            <h3>Sustainable Luxury</h3>
            <p>Ethically sourced ingredients from sustainable farms worldwide</p>
          </div>
          <div className="value-card">
            <span className="value-icon">🎨</span>
            <h3>Artisanal Craft</h3>
            <p>Each fragrance is handcrafted by master perfumers with decades of experience</p>
          </div>
          <div className="value-card">
            <span className="value-icon">💎</span>
            <h3>Rare Ingredients</h3>
            <p>We source the finest and rarest ingredients from every corner of the globe</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Contact Page
function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="contact-page">
      <div className="page-hero">
        <h1>Contact Us</h1>
        <p>We'd love to hear from you</p>
      </div>

      <div className="contact-container">
        <div className="contact-info-section">
          <div className="contact-info-card">
            <h3>Visit Us</h3>
            <p>123 Fragrance Lane<br />New York, NY 10001</p>
          </div>
          <div className="contact-info-card">
            <h3>Call Us</h3>
            <p>+1 (555) 123-4567</p>
          </div>
          <div className="contact-info-card">
            <h3>Email Us</h3>
            <p>info@silenceperfumes.com</p>
          </div>
        </div>

        <div className="contact-form-section">
          {submitted ? (
            <div className="success-message">
              <span className="success-icon">✓</span>
              <h3>Message Sent!</h3>
              <p>Thank you for reaching out. We'll get back to you within 24 hours.</p>
              <button onClick={() => setSubmitted(false)} className="btn-outline">
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Your full name"
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="your@email.com"
                />
              </div>
              <div className="form-group">
                <label>Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="How can we help?"
                />
              </div>
              <div className="form-group">
                <label>Message *</label>
                <textarea
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows="6"
                  placeholder="Tell us more..."
                />
              </div>
              <button type="submit" className="btn-primary submit-btn">
                Send Message
                <span className="btn-arrow">→</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// Footer Component
function Footer() {
  const { isDark, setIsDark } = React.useContext(ThemeContext);

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3>SILENCE</h3>
            <span className="footer-subtitle">PERFUMES</span>
            <p>Mystery in Every Drop</p>
          </div>

          <div className="footer-links">
            <h4>Explore</h4>
            <Link to="/collections">Collections</Link>
            <Link to="/about">Our Story</Link>
            <Link to="/contact">Contact</Link>
          </div>

          <div className="footer-links">
            <h4>Customer Care</h4>
            <Link to="/contact">Shipping & Returns</Link>
            <Link to="/contact">FAQ</Link>
            <Link to="/contact">Privacy Policy</Link>
          </div>

          <div className="footer-social">
            <h4>Connect</h4>
            <div className="social-icons">
              <a href="#" className="social-icon">IG</a>
              <a href="#" className="social-icon">FB</a>
              <a href="#" className="social-icon">PT</a>
            </div>
            <div className="theme-switch">
              <span>Theme</span>
              <button
                className="theme-switch-btn"
                onClick={() => setIsDark(!isDark)}
              >
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2024 Silence Perfumes. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

// Rating Stars Component
function RatingStars({ rating }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i} style={{
        color: i <= Math.floor(rating) ? '#ffd700' : '#ccc',
        fontSize: '14px'
      }}>
        ★
      </span>
    );
  }
  return <span style={{ marginLeft: '10px' }}>{stars}</span>;
}

// ProductCard component
function ProductCard({ product }) {
  return (
    <div className="product-card">
      <div className="product-image">
        <span style={{ fontSize: '60px' }}>
          {product.category === 'oriental' ? '🌙' :
            product.category === 'floral' ? '🌸' :
              product.category === 'woody' ? '🌲' :
                product.category === 'fresh' ? '🍋' : '👜'}
        </span>
      </div>
      <div className="product-info">
        <span style={{
          fontSize: '10px',
          letterSpacing: '2px',
          color: '#8b7355',
          textTransform: 'uppercase'
        }}>
          {product.category}
        </span>
        <h3>{product.name}</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
          <RatingStars rating={product.rating} />
          <span style={{ fontSize: '12px', color: '#888', marginLeft: '5px' }}>
            ({product.reviews})
          </span>
        </div>
        <p style={{ color: '#666', fontStyle: 'italic', marginBottom: '10px' }}>
          {product.notes}
        </p>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          marginBottom: '15px',
          fontSize: '12px',
          color: '#888'
        }}>
          <span>🕐 {product.longevity}</span>
          <span>📅 {product.season}</span>
        </div>
        <p style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '15px',
          color: '#2c2c2c'
        }}>
          ${product.price}
        </p>
        <Link to={`/product/${product.id}`} className="btn-outline">
          View Details
        </Link>
      </div>
    </div>
  );
}

// Main App Component
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
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;