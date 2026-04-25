import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import './Home.css';

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/products');
        setFeaturedProducts(response.data.slice(0, 4));
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            The Story of a One
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            An olfactory journey into the depths of human relationships. 
            Perfumed Escudero Uniquely.
          </motion.p>
          <Link to="/collections" className="btn-primary">
            DISCOVER THE COLLECTION
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-products">
        <div className="container">
          <h2>HEROICENH</h2>
          <p className="subtitle">PERFUMES & DISTILLERY</p>
          <div className="products-grid">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                className="product-card"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="product-image">
                  <div className="image-placeholder">
                    {product.name.split(' ')[0]}
                  </div>
                </div>
                <h3>{product.name}</h3>
                <p className="product-notes">{product.notes}</p>
                <p className="product-price">${product.price.toFixed(2)}</p>
                <Link to={`/product/${product.id}`} className="btn-outline">
                  View Details
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="philosophy">
        <div className="container">
          <h2>OUR PHILOSOPHY</h2>
          <h3>Mystery in Every Drop</h3>
          <p className="philosophy-quote">
            "We believe that true luxury is about not needing to shout, 
            it is the quiet presence that lingers long after the conversation has ended."
          </p>
          <p className="philosophy-text">
            Silence Perfumes was born from a desire to strip away the noise of the modern world. 
            Each fragrance is a distillation of her beauty, crafted by master perfumers using 
            the work of rare and timeless materials. We do not follow trends; we capture moments 
            of profound stillness.
          </p>
          <Link to="/about" className="btn-outline">
            LEARN OUR HERITAGE
          </Link>
        </div>
      </section>

      {/* Seasonal Scent Section */}
      <section className="seasonal">
        <div className="container">
          <div className="seasonal-content">
            <h2>THE SEASONAL SCENT</h2>
            <h3>ORCHID RITUAL</h3>
            <p>THE NEW FRAGRANCE FOR THE SOUL</p>
            <div className="seasonal-notes">
              <span>HERBAL BLUSH ESSENCES</span>
              <span className="divider">|</span>
              <span>COLOR STONE</span>
            </div>
            <button className="btn-primary">SHOP NOW</button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;