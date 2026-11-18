const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
app.disable('x-powered-by');
app.use(cors());
app.use(express.json({ limit: '32kb' }));
app.use((_req, res, next) => {
  res.set({ 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'Permissions-Policy': 'camera=(), microphone=(), geolocation=()' });
  next();
});
const productionStorageReady = () => process.env.NODE_ENV !== 'production' || Boolean(process.env.MONGODB_URI);
function requireStorage(_req, res, next) {
  return productionStorageReady() ? next() : res.status(503).json({ error: 'Order storage is not configured.' });
}

const products = [
  { id: 1, name: 'Mystique Oud', brand: 'Golden Perfume House', category: 'Oriental', family: 'Amber · Oud', description: 'A deep, enveloping composition of oud, rose and warm amber.', notes: ['Bergamot & saffron', 'Bulgarian rose & oud', 'Amber, musk & vanilla'], occasions: ['Evening', 'Special occasion'], color: '#69432e', featured: true },
  { id: 2, name: 'Rose Éternelle', brand: 'Golden Perfume House', category: 'Floral', family: 'Floral · Musk', description: 'A delicate rose composition with a soft, graceful finish.', notes: ['Lychee & bergamot', 'Damask rose & peony', 'White musk & cedarwood'], occasions: ['Everyday', 'Special occasion'], color: '#a77b78', featured: true },
  { id: 3, name: 'Bois de Santal', brand: 'Golden Perfume House', category: 'Woody', family: 'Wood · Iris', description: 'Creamy sandalwood layered with quiet spice and powdery iris.', notes: ['Cardamom & pink pepper', 'Iris & violet', 'Sandalwood & vetiver'], occasions: ['Work', 'Evening'], color: '#87745c', featured: true },
  { id: 4, name: 'Citrus Absolu', brand: 'Golden Perfume House', category: 'Fresh', family: 'Citrus · Aromatic', description: 'An elegant burst of citrus that settles into a clean, aromatic trail.', notes: ['Lemon & bergamot', 'Lavender & rosemary', 'White musk & oakmoss'], occasions: ['Everyday', 'Warm weather'], color: '#999062', featured: false },
  { id: 5, name: 'Velvet Amber', brand: 'Golden Perfume House', category: 'Oriental', family: 'Amber · Spice', description: 'A warm amber veil brightened by saffron and soft spice.', notes: ['Mandarin & saffron', 'Cinnamon & labdanum', 'Amber, tonka & musk'], occasions: ['Evening', 'Special occasion'], color: '#8a5e38', featured: false },
  { id: 6, name: 'Jardin Blanc', brand: 'Golden Perfume House', category: 'Floral', family: 'White Floral · Musk', description: 'A luminous white floral with a soft, clean finish.', notes: ['Neroli & pear', 'Jasmine & orange blossom', 'White musk & sandalwood'], occasions: ['Everyday', 'Spring'], color: '#c8bfa8', featured: false },
  { id: 7, name: 'Nocturne Cedar', brand: 'Golden Perfume House', category: 'Woody', family: 'Cedar · Leather', description: 'Dry cedar and suede create a quietly magnetic evening scent.', notes: ['Black pepper & bergamot', 'Cedar & suede', 'Vetiver, patchouli & amber'], occasions: ['Work', 'Evening'], color: '#5f5648', featured: false },
  { id: 8, name: 'Verde Lumen', brand: 'Golden Perfume House', category: 'Fresh', family: 'Green · Citrus', description: 'A crisp green composition with a bright, lasting trail.', notes: ['Grapefruit & basil', 'Green tea & fig leaf', 'Moss, cedar & musk'], occasions: ['Everyday', 'Warm weather'], color: '#7d8968', featured: false },
  { id: 9, name: 'Saffron Veil', brand: 'Golden Perfume House', category: 'Oriental', family: 'Saffron · Resin', description: 'A glowing saffron trail wrapped in dark resin and soft woods.', notes: ['Saffron & cardamom', 'Rose & incense', 'Benzoin, amber & cedar'], occasions: ['Evening', 'Special occasion'], color: '#9a6c3f', featured: false },
  { id: 10, name: 'Fleur de Lune', brand: 'Golden Perfume House', category: 'Floral', family: 'Iris · Powder', description: 'A quiet iris and violet accord with a tender, powdery finish.', notes: ['Pear & violet leaf', 'Iris & heliotrope', 'Cashmere wood & musk'], occasions: ['Everyday', 'Work'], color: '#aaa0ad', featured: false },
  { id: 11, name: 'Atlas Smoke', brand: 'Golden Perfume House', category: 'Woody', family: 'Smoke · Woods', description: 'Polished woods and a veil of smoke create a grounded signature.', notes: ['Juniper & pepper', 'Guaiac wood & cedar', 'Leather, vetiver & birch'], occasions: ['Evening', 'Work'], color: '#6f6258', featured: false },
  { id: 12, name: 'Limonata Verde', brand: 'Golden Perfume House', category: 'Fresh', family: 'Citrus · Green', description: 'Sparkling lemon and crushed green leaves feel bright and effortless.', notes: ['Lemon & petitgrain', 'Mint & verbena', 'Musk, moss & cedar'], occasions: ['Everyday', 'Warm weather'], color: '#a4aa72', featured: false }
].map(product => ({ ...product, size: null, price: null, stock: 0, verified: false, availability: 'Awaiting supplier confirmation' }));

const statuses = ['Order placed', 'Confirmed', 'Preparing', 'Dispatched', 'Out for delivery', 'Delivered', 'Cancelled'];
const clean = (value, max = 160) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const normalizedPhone = value => clean(value, 40).replace(/[^\d+]/g, '');
const filePath = process.env.DATA_FILE || path.join(__dirname, 'data', 'orders.json');
const testimonialFilePath = process.env.TESTIMONIALS_FILE || path.join(__dirname, 'data', 'testimonials.json');
const messageFilePath = process.env.MESSAGES_FILE || path.join(__dirname, 'data', 'messages.json');
const subscriberFilePath = process.env.SUBSCRIBERS_FILE || path.join(__dirname, 'data', 'subscribers.json');
const productFilePath = process.env.PRODUCTS_FILE || path.join(__dirname, 'data', 'products.json');
let mongoCollection;
let mongoTestimonials;
let mongoMessages;
let mongoSubscribers;
let mongoProducts;

async function collection() {
  if (!process.env.MONGODB_URI) return null;
  if (!mongoCollection) {
    const { MongoClient } = require('mongodb');
    const client = new MongoClient(process.env.MONGODB_URI);
    mongoCollection = client.connect().then(async () => {
      const db = client.db(process.env.MONGODB_DB || 'silence');
      const orders = db.collection('orders');
      mongoTestimonials = db.collection('testimonials');
      mongoMessages = db.collection('messages');
      mongoSubscribers = db.collection('subscribers');
      mongoProducts = db.collection('products');
      await orders.createIndex({ code: 1 }, { unique: true });
      return orders;
    }).catch(error => { mongoCollection = null; throw error; });
  }
  return mongoCollection;
}

async function testimonialCollection() {
  if (!process.env.MONGODB_URI) return null;
  await collection();
  return mongoTestimonials;
}

async function messageCollection() {
  if (!process.env.MONGODB_URI) return null;
  await collection();
  return mongoMessages;
}

async function subscriberCollection() {
  if (!process.env.MONGODB_URI) return null;
  await collection();
  return mongoSubscribers;
}

async function productCollection() {
  if (!process.env.MONGODB_URI) return null;
  await collection();
  return mongoProducts;
}

function readLocal() {
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeLocal(orders) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const temp = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(orders, null, 2));
  fs.renameSync(temp, filePath);
}

function readTestimonials() {
  if (!fs.existsSync(testimonialFilePath)) return [];
  return JSON.parse(fs.readFileSync(testimonialFilePath, 'utf8'));
}

function writeTestimonials(items) {
  fs.mkdirSync(path.dirname(testimonialFilePath), { recursive: true });
  const temp = `${testimonialFilePath}.${process.pid}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(items, null, 2));
  fs.renameSync(temp, testimonialFilePath);
}

function readMessages() {
  if (!fs.existsSync(messageFilePath)) return [];
  return JSON.parse(fs.readFileSync(messageFilePath, 'utf8'));
}

function writeMessages(items) {
  fs.mkdirSync(path.dirname(messageFilePath), { recursive: true });
  const temp = `${messageFilePath}.${process.pid}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(items, null, 2));
  fs.renameSync(temp, messageFilePath);
}

function readSubscribers() {
  if (!fs.existsSync(subscriberFilePath)) return [];
  return JSON.parse(fs.readFileSync(subscriberFilePath, 'utf8'));
}

function writeSubscribers(items) {
  fs.mkdirSync(path.dirname(subscriberFilePath), { recursive: true });
  const temp = `${subscriberFilePath}.${process.pid}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(items, null, 2));
  fs.renameSync(temp, subscriberFilePath);
}

function readProductOverrides() {
  if (!fs.existsSync(productFilePath)) return [];
  return JSON.parse(fs.readFileSync(productFilePath, 'utf8'));
}

function writeProductOverrides(items) {
  fs.mkdirSync(path.dirname(productFilePath), { recursive: true });
  const temp = `${productFilePath}.${process.pid}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(items, null, 2));
  fs.renameSync(temp, productFilePath);
}

async function listProducts() {
  const db = await productCollection();
  const overrides = db ? await db.find({}, { projection: { _id: 0 } }).toArray() : readProductOverrides();
  return products.map(product => {
    const item = { ...product, ...overrides.find(override => override.id === product.id) };
    return item.verified ? item : { ...item, description: 'Description pending supplier verification.', notes: ['Pending verification', 'Pending verification', 'Pending verification'] };
  });
}

async function listOrders() {
  const db = await collection();
  return db ? db.find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).limit(500).toArray() : readLocal();
}

async function saveOrder(order) {
  const db = await collection();
  if (db) await db.updateOne({ code: order.code }, { $set: order }, { upsert: true });
  else {
    const orders = readLocal();
    const index = orders.findIndex(item => item.code === order.code);
    if (index === -1) orders.unshift(order); else orders[index] = order;
    writeLocal(orders);
  }
}

function requireAdmin(req, res, next) {
  const key = process.env.ADMIN_API_KEY;
  const supplied = (req.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!key || !supplied) return res.status(401).json({ error: 'Admin access required.' });
  const a = Buffer.from(key); const b = Buffer.from(supplied);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return res.status(401).json({ error: 'Invalid admin key.' });
  next();
}

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.get('/api/config', (_req, res) => res.json({
  whatsapp: clean(process.env.WHATSAPP_NUMBER, 30).replace(/\D/g, ''),
  supportEmail: clean(process.env.SUPPORT_EMAIL, 120),
  businessIdentity: clean(process.env.BUSINESS_IDENTITY, 160),
  deliverySummary: clean(process.env.DELIVERY_SUMMARY, 300),
  returnsSummary: clean(process.env.RETURNS_SUMMARY, 300),
  trackingEnabled: Boolean(process.env.MONGODB_URI || process.env.NODE_ENV !== 'production'),
  checkoutEnabled: false,
  newsletterEnabled: productionStorageReady()
}));
app.get('/api/products', async (_req, res, next) => { try { res.json(await listProducts()); } catch (error) { next(error); } });
app.get('/api/products/:id', async (req, res, next) => {
  try {
    const product = (await listProducts()).find(item => item.id === Number(req.params.id));
    return product ? res.json(product) : res.status(404).json({ error: 'Product not found.' });
  } catch (error) { next(error); }
});

app.patch('/api/admin/products/:id', requireAdmin, requireStorage, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!products.some(product => product.id === id)) return res.status(404).json({ error: 'Product not found.' });
    const size = clean(req.body.size, 40);
    const price = Number(req.body.price);
    const stock = Number(req.body.stock);
    const verified = req.body.verified === true;
    if (!size || !Number.isFinite(price) || price < 0 || !Number.isInteger(stock) || stock < 0) return res.status(400).json({ error: 'Provide a bottle size, non-negative price and whole-number stock.' });
    const item = { id, size, price, stock, verified, availability: stock > 0 ? 'In stock' : 'Out of stock', updatedAt: new Date().toISOString() };
    const db = await productCollection();
    if (db) await db.updateOne({ id }, { $set: item }, { upsert: true });
    else {
      const items = readProductOverrides().filter(entry => entry.id !== id);
      writeProductOverrides([item, ...items]);
    }
    res.json({ ...products.find(product => product.id === id), ...item });
  } catch (error) { next(error); }
});

app.post('/api/contact', requireStorage, async (req, res, next) => {
  try {
    const name = clean(req.body.name, 80);
    const contact = clean(req.body.contact, 160);
    const topic = clean(req.body.topic, 80);
    const message = clean(req.body.message, 1200);
    if (!name || !contact || !topic || !message) return res.status(400).json({ error: 'Complete every contact field.' });
    const item = { id: crypto.randomUUID(), name, contact, topic, message, status: 'New', createdAt: new Date().toISOString() };
    const db = await messageCollection();
    if (db) await db.insertOne(item); else writeMessages([item, ...readMessages()]);
    delete item._id;
    res.status(201).json({ id: item.id, message: 'Your message has reached the house. We will reply within two business days.' });
  } catch (error) { next(error); }
});

app.get('/api/admin/messages', requireAdmin, requireStorage, async (_req, res, next) => {
  try {
    const db = await messageCollection();
    res.json(db ? await db.find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray() : readMessages());
  } catch (error) { next(error); }
});

app.patch('/api/admin/messages/:id', requireAdmin, requireStorage, async (req, res, next) => {
  try {
    const id = clean(req.params.id, 80);
    const status = clean(req.body.status, 20);
    if (!['New', 'In progress', 'Resolved'].includes(status)) return res.status(400).json({ error: 'Invalid message status.' });
    const db = await messageCollection();
    let item;
    if (db) item = await db.findOneAndUpdate({ id }, { $set: { status } }, { returnDocument: 'after', projection: { _id: 0 } });
    else {
      const items = readMessages();
      item = items.find(entry => entry.id === id);
      if (item) { item.status = status; writeMessages(items); }
    }
    return item ? res.json(item) : res.status(404).json({ error: 'Message not found.' });
  } catch (error) { next(error); }
});

app.post('/api/newsletter', requireStorage, async (req, res, next) => {
  try {
    const email = clean(req.body.email, 160).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || req.body.consent !== true) return res.status(400).json({ error: 'Enter a valid email and confirm your consent.' });
    const token = crypto.randomBytes(24).toString('hex');
    const item = { email, token, active: true, consentedAt: new Date().toISOString() };
    const db = await subscriberCollection();
    if (db) await db.updateOne({ email }, { $set: item }, { upsert: true });
    else {
      const items = readSubscribers().filter(entry => entry.email !== email);
      writeSubscribers([item, ...items]);
    }
    res.status(201).json({ message: 'You are subscribed. Every email will include an unsubscribe link.', token });
  } catch (error) { next(error); }
});

app.post('/api/newsletter/unsubscribe', requireStorage, async (req, res, next) => {
  try {
    const token = clean(req.body.token, 80);
    const db = await subscriberCollection();
    let changed = false;
    if (db) changed = (await db.updateOne({ token }, { $set: { active: false, unsubscribedAt: new Date().toISOString() } })).matchedCount > 0;
    else {
      const items = readSubscribers();
      const item = items.find(entry => entry.token === token);
      if (item) { item.active = false; item.unsubscribedAt = new Date().toISOString(); writeSubscribers(items); changed = true; }
    }
    return changed ? res.json({ message: 'You have been unsubscribed.' }) : res.status(404).json({ error: 'That unsubscribe link is invalid or expired.' });
  } catch (error) { next(error); }
});

app.get('/api/testimonials', requireStorage, async (_req, res, next) => {
  try {
    const db = await testimonialCollection();
    const items = db ? await db.find({ approved: true }, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray() : readTestimonials().filter(item => item.approved);
    res.json(items);
  } catch (error) { next(error); }
});

app.post('/api/testimonials', requireStorage, async (req, res, next) => {
  try {
    const name = clean(req.body.name, 80);
    const quote = clean(req.body.quote, 1000);
    const permission = req.body.permission === true;
    if (!name || !quote || !permission) return res.status(400).json({ error: 'Add your name, story and permission to submit.' });
    const item = { id: crypto.randomUUID(), type: 'text', name, title: 'A Fragrance, A Memory, A Story', quote, src: '', approved: false, permission, createdAt: new Date().toISOString() };
    const db = await testimonialCollection();
    if (db) await db.insertOne(item); else writeTestimonials([item, ...readTestimonials()]);
    delete item._id;
    res.status(201).json({ message: 'Thank you. Your story is private until the house reviews it for publication.' });
  } catch (error) { next(error); }
});

app.get('/api/admin/testimonials', requireAdmin, requireStorage, async (_req, res, next) => {
  try {
    const db = await testimonialCollection();
    res.json(db ? await db.find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray() : readTestimonials());
  } catch (error) { next(error); }
});

app.post('/api/admin/testimonials', requireAdmin, requireStorage, async (req, res, next) => {
  try {
    const type = clean(req.body.type, 10);
    const name = clean(req.body.name, 80);
    const title = clean(req.body.title, 100);
    const quote = clean(req.body.quote, 1000);
    const src = clean(req.body.src, 500);
    if (!['text', 'audio', 'video'].includes(type) || !name || (type === 'text' ? !quote : !/^https:\/\//i.test(src))) return res.status(400).json({ error: 'Provide a name and quote or HTTPS media URL.' });
    const item = { id: crypto.randomUUID(), type, name, title, quote: type === 'text' ? quote : '', src: type === 'text' ? '' : src, approved: Boolean(req.body.approved), createdAt: new Date().toISOString() };
    const db = await testimonialCollection();
    if (db) await db.insertOne(item); else writeTestimonials([item, ...readTestimonials()]);
    delete item._id;
    res.status(201).json(item);
  } catch (error) { next(error); }
});

app.patch('/api/admin/testimonials/:id', requireAdmin, requireStorage, async (req, res, next) => {
  try {
    const id = clean(req.params.id, 80);
    const approved = Boolean(req.body.approved);
    const db = await testimonialCollection();
    let item;
    if (db) {
      const result = await db.findOneAndUpdate({ id }, { $set: { approved } }, { returnDocument: 'after', projection: { _id: 0 } });
      item = result;
    } else {
      const items = readTestimonials();
      item = items.find(entry => entry.id === id);
      if (item) { item.approved = approved; writeTestimonials(items); }
    }
    return item ? res.json(item) : res.status(404).json({ error: 'Story not found.' });
  } catch (error) { next(error); }
});

app.post('/api/orders/track', requireStorage, async (req, res, next) => {
  try {
    const code = clean(req.body.code, 32).toUpperCase();
    const phone = normalizedPhone(req.body.phone);
    if (!/^SL-[A-Z0-9]{8}$/.test(code) || phone.length < 7) return res.status(400).json({ error: 'Enter a valid order code and phone number.' });
    const db = await collection();
    const order = db ? await db.findOne({ code, phone }, { projection: { _id: 0 } }) : readLocal().find(item => item.code === code && item.phone === phone);
    if (!order) return res.status(404).json({ error: 'No order matches those details.' });
    const { customerName, productIds, status, history, createdAt } = order;
    const catalogue = await listProducts();
    res.json({ code, customerName, products: productIds.map(id => catalogue.find(p => p.id === id)?.name).filter(Boolean), status, history, createdAt });
  } catch (error) { next(error); }
});

app.post('/api/reviews', requireStorage, async (req, res, next) => {
  try {
    const code = clean(req.body.code, 32).toUpperCase();
    const phone = normalizedPhone(req.body.phone);
    const productId = Number(req.body.productId);
    const rating = Number(req.body.rating);
    const quote = clean(req.body.quote, 1000);
    const permission = req.body.permission === true;
    const db = await collection();
    const order = db ? await db.findOne({ code, phone }, { projection: { _id: 0 } }) : readLocal().find(item => item.code === code && item.phone === phone);
    if (!order || order.status !== 'Delivered' || !order.productIds.includes(productId)) return res.status(403).json({ error: 'Reviews are available after a matching order is delivered.' });
    if (!Number.isInteger(rating) || rating < 1 || rating > 5 || !quote || !permission) return res.status(400).json({ error: 'Add a rating, review and permission to submit.' });
    const product = products.find(item => item.id === productId);
    const item = { id: crypto.randomUUID(), type: 'text', name: clean(req.body.name, 80) || order.customerName, title: `${product.name} · ${rating}/5`, quote, src: '', productId, rating, verifiedBuyer: true, approved: false, permission, createdAt: new Date().toISOString() };
    const stories = await testimonialCollection();
    if (stories) await stories.insertOne(item); else writeTestimonials([item, ...readTestimonials()]);
    delete item._id;
    res.status(201).json({ message: 'Your verified-buyer review was submitted for moderation.' });
  } catch (error) { next(error); }
});

app.get('/api/admin/orders', requireAdmin, requireStorage, async (_req, res, next) => {
  try { res.json(await listOrders()); } catch (error) { next(error); }
});

app.post('/api/admin/orders', requireAdmin, requireStorage, async (req, res, next) => {
  try {
    const customerName = clean(req.body.customerName, 80);
    const phone = normalizedPhone(req.body.phone);
    const productIds = [...new Set((Array.isArray(req.body.productIds) ? req.body.productIds : []).map(Number))];
    const catalogue = await listProducts();
    if (!customerName || phone.length < 7 || !productIds.length || productIds.some(id => !catalogue.some(p => p.id === id))) return res.status(400).json({ error: 'Provide a name, valid phone number and product.' });
    const now = new Date().toISOString();
    const order = { code: `SL-${crypto.randomBytes(4).toString('hex').toUpperCase()}`, customerName, phone, productIds, status: statuses[0], history: [{ status: statuses[0], at: now }], createdAt: now };
    await saveOrder(order);
    res.status(201).json(order);
  } catch (error) { next(error); }
});

app.patch('/api/admin/orders/:code', requireAdmin, requireStorage, async (req, res, next) => {
  try {
    const code = clean(req.params.code, 32).toUpperCase();
    const status = clean(req.body.status, 40);
    if (!statuses.includes(status)) return res.status(400).json({ error: 'Invalid status.' });
    const orders = await listOrders();
    const order = orders.find(item => item.code === code);
    if (!order) return res.status(404).json({ error: 'Order not found.' });
    if (order.status !== status) {
      order.status = status;
      order.history.push({ status, at: new Date().toISOString() });
      await saveOrder(order);
    }
    res.json(order);
  } catch (error) { next(error); }
});

const buildPath = path.join(__dirname, '..', 'client', 'build');
if (fs.existsSync(path.join(buildPath, 'index.html'))) {
  app.use(express.static(buildPath));
  app.get('*', (_req, res) => res.sendFile(path.join(buildPath, 'index.html')));
}

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'The service is temporarily unavailable.' });
});

if (require.main === module) {
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`GOLDEN PERFUME HOUSE API listening on ${port}`));
}

module.exports = app;
