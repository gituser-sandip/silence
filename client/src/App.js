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
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="products-showcase">
            {products.map((product, index) => (
              <div 
                key={product.id} 
                className="product-showcase-card"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="product-card-inner">
                  <div className="product-image-wrapper">
                    <div className="product-image">
                      <div className="image-accent"></div>
                      <span className="product-initial">{product.name.charAt(0)}</span>
                    </div>
                    <div className="product-overlay">
                      <Link to={`/product/${product.id}`} className="overlay-link">
                        View Details
                      </Link>
                    </div>
                  </div>
                  <div className="product-info">
                    <span className="product-category">{product.category}</span>
                    <h3>{product.name}</h3>
                    <p className="product-notes">{product.notes}</p>
                    <div className="product-footer">
                      <span className="product-price">${product.price}</span>
                      <button className="add-to-cart-btn">
                        <span>+</span> Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
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
              <Link to={`/product/${product.id}`} key={product.id} className="collection-card">
                <div className="collection-image">
                  <span className="collection-initial">{product.name.charAt(0)}</span>
                  <div className="collection-hover">
                    <span>Discover</span>
                  </div>
                </div>
                <div className="collection-info">
                  <h3>{product.name}</h3>
                  <p className="collection-notes">{product.notes}</p>
                  <span className="collection-price">${product.price}</span>
                </div>
              </Link>
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
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <div className="product-detail-container">
        <div className="product-detail-image">
          <span className="detail-initial">{product.name.charAt(0)}</span>
        </div>
        <div className="product-detail-info">
          <span className="detail-category">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="detail-price">${product.price}</p>
          <p className="detail-description">{product.description}</p>
          <div className="detail-notes">
            <h3>Fragrance Notes</h3>
            <p>{product.notes}</p>
          </div>
          <button className="btn-primary add-to-cart-large">
            Add to Cart — ${product.price}
          </button>
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
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="Your full name"
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  required
                  placeholder="your@email.com"
                />
              </div>
              <div className="form-group">
                <label>Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                  placeholder="How can we help?"
                />
              </div>
              <div className="form-group">
                <label>Message *</label>
                <textarea
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
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