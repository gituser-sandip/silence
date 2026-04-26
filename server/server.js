const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

// Products data
const products = [
  {
    id: 1,
    name: "Mystique Oud",
    price: 285.00,
    description: "An enchanting blend of rare Oud wood, Bulgarian rose, and amber.",
    notes: "Top: Bergamot, Saffron | Heart: Bulgarian Rose, Oud | Base: Amber, Musk, Vanilla",
    category: "oriental",
    rating: 4.9,
    reviews: 128,
    longevity: "10-12 hours",
    season: "Fall/Winter"
  },
  {
    id: 2,
    name: "Rose Éternelle",
    price: 245.00,
    description: "A timeless rose fragrance that captures the essence of a blooming garden at dawn.",
    notes: "Top: Lychee, Bergamot | Heart: Damask Rose, Peony | Base: White Musk, Cedarwood",
    category: "floral",
    rating: 4.8,
    reviews: 95,
    longevity: "8-10 hours",
    season: "Spring/Summer"
  },
  {
    id: 3,
    name: "Bois de Santal",
    price: 265.00,
    description: "A creamy, woody fragrance centered around the finest Mysore sandalwood.",
    notes: "Top: Cardamom, Pink Pepper | Heart: Iris, Violet | Base: Sandalwood, Tonka Bean, Vetiver",
    category: "woody",
    rating: 4.9,
    reviews: 156,
    longevity: "10-12 hours",
    season: "All Seasons"
  },
  {
    id: 4,
    name: "Citrus Absolu",
    price: 195.00,
    description: "A vibrant and sophisticated citrus composition that evolves beautifully on the skin.",
    notes: "Top: Lemon, Bergamot, Grapefruit | Heart: Lavender, Rosemary | Base: White Musk, Oakmoss, Ambergris",
    category: "fresh",
    rating: 4.7,
    reviews: 201,
    longevity: "6-8 hours",
    season: "Spring/Summer"
  }
];

// ===== API ROUTES =====
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

// ===== SERVE REACT FRONTEND =====
// Serve static files from React build
app.use(express.static(path.join(__dirname, '../client/build')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});