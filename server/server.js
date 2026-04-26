const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Products data
const products = [
  {
    id: 1,
    name: "Curation - The Signature Series",
    price: 240.00,
    description: "A masterpiece of carefully curated notes",
    notes: "Our, Leather, Modigliani, Jasmine",
    category: "signature"
  },
  {
    id: 2,
    name: "Nanie Essence",
    price: 240.00,
    description: "An olfactory journey into elegance",
    notes: "Our, Leather, Modigliani, Jasmine",
    category: "essence"
  },
  {
    id: 3,
    name: "Lumine",
    price: 210.00,
    description: "Light and radiant composition",
    notes: "Bergamot, White Tea, Cedar",
    category: "fresh"
  },
  {
    id: 4,
    name: "Saint Paul Oude",
    price: 225.00,
    description: "Deep and mysterious oriental scent",
    notes: "Toute Semaine, Amber, Iris",
    category: "oriental"
  }
];

// API Routes
app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(product);
});

app.post('/api/contact', (req, res) => {
  console.log('Contact form:', req.body);
  res.json({ success: true, message: 'Message received!' });
});

// For Vercel, export the app
module.exports = app;

// For local development
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
}