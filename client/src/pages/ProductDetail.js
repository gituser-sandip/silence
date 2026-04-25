import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import './ProductDetail.css';

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`/api/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };
    fetchProduct();
  }, [id]);

  if (!product) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="product-detail">
      <div className="container">
        <div className="product-layout">
          <motion.div
            className="product-image-section"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="product-detail-image">
              <div className="image-placeholder">
                {product.name.charAt(0)}
              </div>
            </div>
          </motion.div>

          <motion.div
            className="product-info-section"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p className="category">{product.category}</p>
            <h1>{product.name}</h1>
            <p className="price">${product.price.toFixed(2)}</p>
            
            <div className="product-description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>

            <div className="product-notes-section">
              <h3>Fragrance Notes</h3>
              <p>{product.notes}</p>
            </div>

            <div className="quantity-selector">
              <h3>Quantity</h3>
              <div className="quantity-controls">
                <button>-</button>
                <span>1</span>
                <button>+</button>
              </div>
            </div>

            <button className="btn-primary add-to-cart">
              ADD TO CART
            </button>

            <div className="additional-info">
              <div className="info-item">
                <h4>Free Shipping</h4>
                <p>On orders over $150</p>
              </div>
              <div className="info-item">
                <h4>Secure Payment</h4>
                <p>100% secure checkout</p>
              </div>
              <div className="info-item">
                <h4>Sample Included</h4>
                <p>Free sample with every order</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;