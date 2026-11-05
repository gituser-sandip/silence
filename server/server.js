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
const productionStorageReady = () => process.env.NODE_ENV !== 'production' || Boolean(process.env.MONGODB_URI);
function requireStorage(_req, res, next) {
  return productionStorageReady() ? next() : res.status(503).json({ error: 'Order storage is not configured.' });
}

const products = [
  { id: 1, name: 'Mystique Oud', category: 'Oriental', family: 'Amber · Oud', description: 'A deep, enveloping composition of oud, rose and warm amber.', notes: ['Bergamot & saffron', 'Bulgarian rose & oud', 'Amber, musk & vanilla'], color: '#69432e', featured: true },
  { id: 2, name: 'Rose Éternelle', category: 'Floral', family: 'Floral · Musk', description: 'A delicate rose composition with a soft, graceful finish.', notes: ['Lychee & bergamot', 'Damask rose & peony', 'White musk & cedarwood'], color: '#a77b78', featured: true },
  { id: 3, name: 'Bois de Santal', category: 'Woody', family: 'Wood · Iris', description: 'Creamy sandalwood layered with quiet spice and powdery iris.', notes: ['Cardamom & pink pepper', 'Iris & violet', 'Sandalwood & vetiver'], color: '#87745c', featured: true },
  { id: 4, name: 'Citrus Absolu', category: 'Fresh', family: 'Citrus · Aromatic', description: 'An elegant burst of citrus that settles into a clean, aromatic trail.', notes: ['Lemon & bergamot', 'Lavender & rosemary', 'White musk & oakmoss'], color: '#999062', featured: false }
];

const statuses = ['Order placed', 'Confirmed', 'Preparing', 'Dispatched', 'Out for delivery', 'Delivered', 'Cancelled'];
const clean = (value, max = 160) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const normalizedPhone = value => clean(value, 40).replace(/[^\d+]/g, '');
const filePath = process.env.DATA_FILE || path.join(__dirname, 'data', 'orders.json');
const testimonialFilePath = process.env.TESTIMONIALS_FILE || path.join(__dirname, 'data', 'testimonials.json');
let mongoCollection;
let mongoTestimonials;

async function collection() {
  if (!process.env.MONGODB_URI) return null;
  if (!mongoCollection) {
    const { MongoClient } = require('mongodb');
    const client = new MongoClient(process.env.MONGODB_URI);
    mongoCollection = client.connect().then(async () => {
      const db = client.db(process.env.MONGODB_DB || 'silence');
      const orders = db.collection('orders');
      mongoTestimonials = db.collection('testimonials');
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
app.get('/api/config', (_req, res) => res.json({ whatsapp: clean(process.env.WHATSAPP_NUMBER, 30).replace(/\D/g, ''), trackingEnabled: Boolean(process.env.MONGODB_URI || process.env.NODE_ENV !== 'production') }));
app.get('/api/products', (_req, res) => res.json(products));
app.get('/api/products/:id', (req, res) => {
  const product = products.find(item => item.id === Number(req.params.id));
  return product ? res.json(product) : res.status(404).json({ error: 'Product not found.' });
});

app.get('/api/testimonials', requireStorage, async (_req, res, next) => {
  try {
    const db = await testimonialCollection();
    const items = db ? await db.find({ approved: true }, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray() : readTestimonials().filter(item => item.approved);
    res.json(items);
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
    res.json({ code, customerName, products: productIds.map(id => products.find(p => p.id === id)?.name).filter(Boolean), status, history, createdAt });
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
    if (!customerName || phone.length < 7 || !productIds.length || productIds.some(id => !products.some(p => p.id === id))) return res.status(400).json({ error: 'Provide a name, valid phone number and product.' });
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
