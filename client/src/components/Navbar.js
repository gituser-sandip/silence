import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaShoppingBag, FaBars, FaTimes } from 'react-icons/fa';
import './Navbar.css';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <h1>SILENCE</h1>
          <span className="logo-subtitle">PERFUMES</span>
        </Link>

        <div className={`nav-menu ${isOpen ? 'active' : ''}`}>
          <Link to="/collections" className="nav-link" onClick={() => setIsOpen(false)}>
            COLLECTIONS
          </Link>
          <Link to="/about" className="nav-link" onClick={() => setIsOpen(false)}>
            NOTES
          </Link>
          <Link to="/about" className="nav-link" onClick={() => setIsOpen(false)}>
            STORY
          </Link>
          <Link to="/collections" className="nav-link" onClick={() => setIsOpen(false)}>
            BOUTIQUE
          </Link>
          <Link to="/contact" className="nav-link" onClick={() => setIsOpen(false)}>
            CONTACT
          </Link>
        </div>

        <div className="nav-actions">
          <button className="cart-btn">
            <FaShoppingBag />
            <span className="cart-count">0</span>
          </button>
          <button className="menu-toggle" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;