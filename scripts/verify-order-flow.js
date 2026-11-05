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
  console.log('Order flow passed: admin access, create, track, update, track again.');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
}).finally(() => {
  server.close();
  fs.rmSync(directory, { recursive: true, force: true });
});
