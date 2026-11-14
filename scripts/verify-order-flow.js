const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'silence-order-check-'));
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = '';
process.env.ADMIN_API_KEY = crypto.randomBytes(32).toString('hex');
process.env.DATA_FILE = path.join(directory, 'orders.json');
process.env.TESTIMONIALS_FILE = path.join(directory, 'testimonials.json');
process.env.MESSAGES_FILE = path.join(directory, 'messages.json');
process.env.SUBSCRIBERS_FILE = path.join(directory, 'subscribers.json');
process.env.PRODUCTS_FILE = path.join(directory, 'products.json');

const app = require('../server/server');
const server = app.listen(0);

async function request(route, method = 'GET', body, authorized = false) {
  const response = await fetch(`http://127.0.0.1:${server.address().port}${route}`, {
    method,
    headers: {
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...(authorized ? { authorization: `Bearer ${process.env.ADMIN_API_KEY}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  return { status: response.status, data: await response.json() };
}

(async () => {
  const unauthenticated = await request('/api/admin/orders');
  assert.equal(unauthenticated.status, 401);

  const product = await request('/api/admin/products/1', 'PATCH', { size: '50 ml', price: 7500, stock: 3, verified: true }, true);
  assert.equal(product.status, 200);
  assert.equal(product.data.availability, 'In stock');
  const config = await request('/api/config');
  assert.equal(config.data.checkoutEnabled, false);

  const created = await request('/api/admin/orders', 'POST', {
    customerName: 'Order Flow Test', phone: '+9779800000000', productIds: [1]
  }, true);
  assert.equal(created.status, 201);
  assert.match(created.data.code, /^SL-[A-Z0-9]{8}$/);

  const tracked = await request('/api/orders/track', 'POST', {
    code: created.data.code, phone: '+9779800000000'
  });
  assert.equal(tracked.status, 200);
  assert.equal(tracked.data.status, 'Order placed');

  const updated = await request(`/api/admin/orders/${created.data.code}`, 'PATCH', {
    status: 'Confirmed'
  }, true);
  assert.equal(updated.status, 200);

  const trackedAgain = await request('/api/orders/track', 'POST', {
    code: created.data.code, phone: '+9779800000000'
  });
  assert.equal(trackedAgain.status, 200);
  assert.equal(trackedAgain.data.status, 'Confirmed');
  assert.equal(trackedAgain.data.history.length, 2);

  const contact = await request('/api/contact', 'POST', { name: 'Customer', contact: 'customer@example.com', topic: 'Choosing a fragrance', message: 'Please help me choose.' });
  assert.equal(contact.status, 201);
  const messages = await request('/api/admin/messages', 'GET', undefined, true);
  assert.equal(messages.status, 200);
  assert.equal(messages.data.length, 1);

  const storyWithoutPermission = await request('/api/testimonials', 'POST', { name: 'Customer', quote: 'A scent memory.', permission: false });
  assert.equal(storyWithoutPermission.status, 400);
  const story = await request('/api/testimonials', 'POST', { name: 'Customer', quote: 'A scent memory.', permission: true });
  assert.equal(story.status, 201);

  const subscription = await request('/api/newsletter', 'POST', { email: 'customer@example.com', consent: true });
  assert.equal(subscription.status, 201);
  const unsubscribe = await request('/api/newsletter/unsubscribe', 'POST', { token: subscription.data.token });
  assert.equal(unsubscribe.status, 200);

  await request(`/api/admin/orders/${created.data.code}`, 'PATCH', { status: 'Delivered' }, true);
  const review = await request('/api/reviews', 'POST', { code: created.data.code, phone: '+9779800000000', productId: 1, rating: 5, quote: 'A thoughtful fragrance.', permission: true });
  assert.equal(review.status, 201);
  console.log('Commerce flow passed: admin, order tracking, contact, consent, newsletter and verified review.');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
}).finally(() => {
  server.close();
  fs.rmSync(directory, { recursive: true, force: true });
});
