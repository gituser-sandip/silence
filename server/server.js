const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Professional perfume products with real references
const products = [
  {
    id: 1,
    name: "Mystique Oud",
    price: 285.00,
    description: "An enchanting blend of rare Oud wood, Bulgarian rose, and amber. This signature scent captures the essence of mystery and sophistication, leaving an unforgettable trail of luxury.",
    notes: "Top: Bergamot, Saffron | Heart: Bulgarian Rose, Oud | Base: Amber, Musk, Vanilla",
    category: "oriental",
    image: "oud",
    reference: "Inspired by: Tom Ford Oud Wood & MFK Oud Satin Mood",
    rating: 4.9,
    reviews: 128,
    size: "100ml / 3.4 fl oz",
    concentration: "Eau de Parfum",
    gender: "Unisex",
    longevity: "10-12 hours",
    season: "Fall/Winter",
    timeOfDay: "Evening"
  },
  {
    id: 2,
    name: "Rose Éternelle",
    price: 245.00,
    description: "A timeless rose fragrance that captures the essence of a blooming garden at dawn. Delicate yet powerful, this scent combines the finest Damask rose with subtle hints of lychee and peony.",
    notes: "Top: Lychee, Bergamot | Heart: Damask Rose, Peony | Base: White Musk, Cedarwood",
    category: "floral",
    image: "rose",
    reference: "Inspired by: Byredo Rose of No Man's Land & Diptyque Eau Rose",
    rating: 4.8,
    reviews: 95,
    size: "100ml / 3.4 fl oz",
    concentration: "Eau de Parfum",
    gender: "Feminine",
    longevity: "8-10 hours",
    season: "Spring/Summer",
    timeOfDay: "Day/Evening"
  },
  {
    id: 3,
    name: "Bois de Santal",
    price: 265.00,
    description: "A creamy, woody fragrance centered around the finest Mysore sandalwood. Warmed by cardamom and softened by iris, this scent is a meditation in a bottle.",
    notes: "Top: Cardamom, Pink Pepper | Heart: Iris, Violet | Base: Sandalwood, Tonka Bean, Vetiver",
    category: "woody",
    image: "sandalwood",
    reference: "Inspired by: Le Labo Santal 33 & Diptyque Tam Dao",
    rating: 4.9,
    reviews: 156,
    size: "100ml / 3.4 fl oz",
    concentration: "Eau de Parfum",
    gender: "Unisex",
    longevity: "10-12 hours",
    season: "All Seasons",
    timeOfDay: "Day/Evening"
  },
  {
    id: 4,
    name: "Citrus Absolu",
    price: 195.00,
    description: "A vibrant and sophisticated citrus composition that evolves beautifully on the skin. Sparkling lemon and bergamot give way to aromatic herbs and a clean, musky base.",
    notes: "Top: Lemon, Bergamot, Grapefruit | Heart: Lavender, Rosemary | Base: White Musk, Oakmoss, Ambergris",
    category: "fresh",
    image: "citrus",
    reference: "Inspired by: Creed Aventus & Maison Margiela Under The Lemon Trees",
    rating: 4.7,
    reviews: 201,
    size: "100ml / 3.4 fl oz",
    concentration: "Eau de Parfum",
    gender: "Unisex",
    longevity: "6-8 hours",
    season: "Spring/Summer",
    timeOfDay: "Day"
  },
  {
    id: 5,
    name: "Ambre Nuit",
    price: 310.00,
    description: "A sensual and sophisticated amber fragrance that wraps you in warmth. Rich amber accord is enhanced by vanilla absolute and precious spices for an intoxicating experience.",
    notes: "Top: Cinnamon, Nutmeg | Heart: Amber, Benzoin | Base: Vanilla, Patchouli, Sandalwood",
    category: "oriental",
    image: "amber",
    reference: "Inspired by: Dior Ambre Nuit & Serge Lutens Ambre Sultan",
    rating: 4.9,
    reviews: 167,
    size: "100ml / 3.4 fl oz",
    concentration: "Eau de Parfum",
    gender: "Unisex",
    longevity: "12+ hours",
    season: "Fall/Winter",
    timeOfDay: "Evening/Night"
  },
  {
    id: 6,
    name: "Jardin Secret",
    price: 225.00,
    description: "A secret garden captured in a bottle. Fresh green notes dance with white florals, creating a scent that's both elegant and naturally beautiful. Perfect for those who appreciate understated luxury.",
    notes: "Top: Green Leaves, Bergamot | Heart: Jasmine, Lily of the Valley | Base: White Tea, Musk",
    category: "floral",
    image: "garden",
    reference: "Inspired by: Jo Malone Jasmine Sambac & Diptyque Olène",
    rating: 4.6,
    reviews: 89,
    size: "100ml / 3.4 fl oz",
    concentration: "Eau de Parfum",
    gender: "Feminine",
    longevity: "7-9 hours",
    season: "Spring/Summer",
    timeOfDay: "Day"
  },
  {
    id: 7,
    name: "Cuir Noir",
    price: 295.00,
    description: "A bold and sophisticated leather fragrance that exudes confidence. Smooth leather accord is blended with tobacco, birch, and subtle floral notes for a complex and addictive scent.",
    notes: "Top: Saffron, Raspberry | Heart: Leather, Birch, Jasmine | Base: Tobacco, Patchouli, Vanilla",
    category: "leather",
    image: "leather",
    reference: "Inspired by: Tom Ford Tuscan Leather & Byredo Black Saffron",
    rating: 4.8,
    reviews: 134,
    size: "100ml / 3.4 fl oz",
    concentration: "Eau de Parfum",
    gender: "Unisex",
    longevity: "10-12 hours",
    season: "Fall/Winter",
    timeOfDay: "Evening"
  },
  {
    id: 8,
    name: "Fleur d'Oranger",
    price: 235.00,
    description: "A radiant orange blossom fragrance that captures the Mediterranean sun. Bright citrus notes blend seamlessly with honeyed neroli and white flowers, creating pure olfactory sunshine.",
    notes: "Top: Petitgrain, Mandarin | Heart: Orange Blossom, Neroli, Honey | Base: White Musk, Cedar",
    category: "fresh",
    image: "orange",
    reference: "Inspired by: Tom Ford Neroli Portofino & Atelier Cologne Grand Néroli",
    rating: 4.7,
    reviews: 112,
    size: "100ml / 3.4 fl oz",
    concentration: "Eau de Parfum",
    gender: "Unisex",
    longevity: "6-8 hours",
    season: "Spring/Summer",
    timeOfDay: "Day"
  },
  {
    id: 9,
    name: "Vanille Noire",
    price: 250.00,
    description: "A dark, sophisticated take on vanilla. Far from sweet or gourmand, this fragrance explores the deeper, more complex facets of vanilla through smoky woods and spices.",
    notes: "Top: Black Pepper, Incense | Heart: Madagascar Vanilla, Orchid | Base: Ebony Wood, Amber, Musk",
    category: "oriental",
    image: "vanilla",
    reference: "Inspired by: Byredo Vanille Antique & Diptyque Eau Duelle",
    rating: 4.8,
    reviews: 143,
    size: "100ml / 3.4 fl oz",
    concentration: "Eau de Parfum",
    gender: "Unisex",
    longevity: "10-12 hours",
    season: "Fall/Winter",
    timeOfDay: "Evening"
  },
  {
    id: 10,
    name: "Vetiver Élégance",
    price: 215.00,
    description: "A refined and modern vetiver fragrance that's both earthy and fresh. Haitian vetiver is paired with citrus and spices, creating a versatile scent suitable for any occasion.",
    notes: "Top: Grapefruit, Ginger | Heart: Haitian Vetiver, Clary Sage | Base: Cedarwood, Tonka Bean",
    category: "fresh",
    image: "vetiver",
    reference: "Inspired by: Byredo Bal d'Afrique & Tom Ford Grey Vetiver",
    rating: 4.7,
    reviews: 98,
    size: "100ml / 3.4 fl oz",
    concentration: "Eau de Parfum",
    gender: "Unisex",
    longevity: "8-10 hours",
    season: "All Seasons",
    timeOfDay: "Day/Evening"
  },
  {
    id: 11,
    name: "Patchouli Intense",
    price: 275.00,
    description: "A modern masterpiece that elevates patchouli to new heights. Rich Indonesian patchouli is balanced with rose, chocolate, and incense for a hypnotic and sophisticated experience.",
    notes: "Top: Bergamot, Pink Pepper | Heart: Patchouli, Rose, Chocolate | Base: Incense, Labdanum, Vanilla",
    category: "woody",
    image: "patchouli",
    reference: "Inspired by: Chanel Coromandel & Maison Francis Kurkdjian Oud",
    rating: 4.9,
    reviews: 176,
    size: "100ml / 3.4 fl oz",
    concentration: "Eau de Parfum",
    gender: "Unisex",
    longevity: "12+ hours",
    season: "Fall/Winter",
    timeOfDay: "Evening/Night"
  },
  {
    id: 12,
    name: "Musc Blanc",
    price: 180.00,
    description: "The ultimate 'your skin but better' fragrance. Clean white musks are layered with subtle florals and soft woods, creating an intimate scent that becomes uniquely yours.",
    notes: "Top: Aldehydes, Bergamot | Heart: White Musk, Iris, Rose | Base: Sandalwood, Amber, Vanilla",
    category: "floral",
    image: "musk",
    reference: "Inspired by: Byredo Blanche & Diptyque Fleur de Peau",
    rating: 4.6,
    reviews: 87,
    size: "100ml / 3.4 fl oz",
    concentration: "Eau de Parfum",
    gender: "Feminine",
    longevity: "6-8 hours",
    season: "All Seasons",
    timeOfDay: "Day"
  }
];

// API Routes
app.get('/api/products', (req, res) => {
  // Add query parameter support for filtering
  const { category, gender, season } = req.query;
  let filteredProducts = [...products];
  
  if (category && category !== 'all') {
    filteredProducts = filteredProducts.filter(p => p.category === category);
  }
  
  if (gender && gender !== 'all') {
    filteredProducts = filteredProducts.filter(p => 
      p.gender.toLowerCase() === gender.toLowerCase() || p.gender === 'Unisex'
    );
  }
  
  if (season && season !== 'all') {
    filteredProducts = filteredProducts.filter(p => 
      p.season.includes(season)
    );
  }
  
  res.json(filteredProducts);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(product);
});

// Get categories
app.get('/api/categories', (req, res) => {
  const categories = [...new Set(products.map(p => p.category))];
  res.json(categories);
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