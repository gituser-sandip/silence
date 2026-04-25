import React from 'react';
import { motion } from 'framer-motion';
import './About.css';

function About() {
  return (
    <div className="about-page">
      <div className="container">
        <motion.div
          className="about-hero"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <h1>Our Story</h1>
          <p>The art of silence in a world of noise</p>
        </motion.div>

        <div className="about-content">
          <motion.div
            className="about-section"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2>Our Philosophy</h2>
            <p>
              Silence Perfumes was born from a desire to strip away the noise of the modern world. 
              Each fragrance is a distillation of her beauty, crafted by master perfumers using the 
              work of rare and timeless materials. We do not follow trends; we capture moments of 
              profound stillness.
            </p>
          </motion.div>

          <motion.div
            className="about-section"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h2>The Artisan Approach</h2>
            <p>
              Our master perfumers travel the world to source the finest ingredients. From the 
              bergamot groves of Italy to the jasmine fields of India, every essence is selected 
              for its purity and character.
            </p>
          </motion.div>

          <motion.div
            className="about-section"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <h2>Sustainability</h2>
            <p>
              We are committed to sustainable practices, from ethically sourced ingredients to 
              eco-friendly packaging. Our bottles are designed to be refillable, reducing waste 
              while preserving luxury.
            </p>
          </motion.div>
        </div>

        <div className="about-values">
          <div className="value-item">
            <h3>200+</h3>
            <p>Rare Ingredients</p>
          </div>
          <div className="value-item">
            <h3>15</h3>
            <p>Years of Heritage</p>
          </div>
          <div className="value-item">
            <h3>100%</h3>
            <p>Natural Essences</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;