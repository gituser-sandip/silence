import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>SILENCE</h3>
            <p>PERFUMES</p>
            <p className="footer-tagline">Mystery in Every Drop</p>
          </div>
          
          <div className="footer-section">
            <h4>Explore</h4>
            <Link to="/collections">Collections</Link>
            <Link to="/about">Our Story</Link>
            <Link to="/about">Notes</Link>
            <Link to="/contact">Contact</Link>
          </div>
          
          <div className="footer-section">
            <h4>Customer Service</h4>
            <Link to="/contact">Shipping & Returns</Link>
            <Link to="/contact">FAQ</Link>
            <Link to="/contact">Size Guide</Link>
            <Link to="/contact">Privacy Policy</Link>
          </div>
          
          <div className="footer-section">
            <h4>Connect</h4>
            <div className="social-links">
              <a href="#" className="social-link">Instagram</a>
              <a href="#" className="social-link">Facebook</a>
              <a href="#" className="social-link">Pinterest</a>
            </div>
            
            <div className="newsletter">
              <h4>Newsletter</h4>
              <p>Subscribe for exclusive offers and stories</p>
              <div className="newsletter-form">
                <input type="email" placeholder="Your email" />
                <button>→</button>
              </div>
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

export default Footer;