// Offline recovery checks: real HTTP and Mongoose validation, in-memory persistence.
// These replace the lost tests; they do not claim Atlas integration coverage.
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { once } = require('node:events');
const mongoose = require('mongoose');
const app = require('../server');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');
const Table = require('../models/Table');
const Reservation = require('../models/Reservation');
const Order = require('../models/Order');
const data = require('../data/seed-data.json');
const collection = require('../../A2/restaurant-api.postman_collection.json');

async function run() {
  for (const [Model, records] of [[User, data.users], [MenuItem, data.menuItems], [Table, data.tables]]) {
    for (const record of records) await new Model(record).validate();
  }
  assert.deepEqual([data.users.length, data.menuItems.length, data.tables.length], [2, 20, 6]);
  assert.deepEqual(data.users.map(user => user.role).sort(), ['customer', 'manager']);
  for (const Model of [User, Table]) assert(Model.schema.indexes().some(([, options]) => options.unique));
  for (const Model of [Reservation, Order]) assert(Model.schema.options.timestamps);
  for (const Model of [User, MenuItem, Table, Reservation, Order]) {
    await assert.rejects(new Model({}).validate());
  }
  await assert.rejects(new User({ ...data.users[0], role: 'admin' }).validate());
  await assert.rejects(new Table({ ...data.tables[0], seats: 0 }).validate());
  const ref = new mongoose.Types.ObjectId();
  await new Reservation({ user: ref, table: ref, date: '2026-10-06', time: '12:00',
    partySize: 2, phone: '0300-1234567' }).validate();
  await new Order({ user: ref, items: [{ menuItem: ref, quantity: 1, name: 'Dish', unitPrice: 10 }],
    subtotal: 10, serviceCharge: 0.5, salesTax: 1.5, discount: 0, total: 12,
    orderType: 'Takeaway', pickupTime: '15 minutes' }).validate();

  const initial = data.menuItems.map(record => new MenuItem(record).toObject());
  const records = new Map(initial.map(item => [String(item._id), item]));
  const methods = ['find', 'findById', 'create', 'findByIdAndUpdate', 'findByIdAndDelete'];
  const originals = Object.fromEntries(methods.map(method => [method, MenuItem[method]]));
  MenuItem.find = async filter => [...records.values()].filter(item =>
    (!filter.category || item.category === filter.category)
    && (!filter.name || new RegExp(filter.name.$regex, filter.name.$options).test(item.name)));
  MenuItem.findById = async id => records.get(id) || null;
  MenuItem.create = async body => {
    const doc = new MenuItem(body);
    await doc.validate();
    const item = doc.toObject();
    records.set(String(item._id), item);
    return item;
  };
  MenuItem.findByIdAndUpdate = async (id, update, options) => {
    assert.equal(options.runValidators, true);
    assert.equal(options.new, true);
    const existing = records.get(id);
    if (!existing) return null;
    const doc = new MenuItem({ ...existing, ...update.$set });
    await doc.validate();
    const item = doc.toObject();
    records.set(id, item);
    return item;
  };
  MenuItem.findByIdAndDelete = async id => {
    const item = records.get(id) || null;
    records.delete(id);
    return item;
  };
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const baseUrl = 'http://127.0.0.1:' + server.address().port;
  let checks = 0;
  async function request(method, route, body) {
    const response = await fetch(baseUrl + route, {
      method, headers: { 'Content-Type': 'application/json' },
      ...(body === undefined ? {} : { body: typeof body === 'string' ? body : JSON.stringify(body) }),
    });
    return { status: response.status, json: await response.json(), headers: response.headers };
  }
  async function status(method, route, body, expected) {
    const response = await request(method, route, body);
    assert.equal(response.status, expected, method + ' ' + route);
    checks++;
    return response;
  }
  try {
    const variables = Object.fromEntries(collection.variable.map(entry => [entry.key, entry.value]));
    variables.baseUrl = baseUrl;
    const expand = value => value.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key]);
    for (const item of collection.item) {
      const req = item.request;
      const url = expand(typeof req.url === 'string' ? req.url : req.url.raw);
      const response = await request(req.method, url.slice(baseUrl.length), req.body?.raw);
      const pm = {
        test: (name, fn) => { fn(); checks++; },
        response: { code: response.status, json: () => response.json,
          to: { have: { status: expected => assert.equal(response.status, expected, item.name) } } },
        collectionVariables: { set: (key, value) => { variables[key] = value; } },
        expect: value => ({ to: { equal: expected => assert.equal(value, expected),
          be: { an: type => assert.equal(type === 'array' && Array.isArray(value), true),
            get true() { assert.equal(value, true); return true; } } } }),
      };
      for (const event of item.event || []) {
        if (event.listen === 'test') vm.runInNewContext(event.script.exec.join('\n'), { pm });
      }
    }
    for (const query of ['search=.*', 'search=%5B', 'search=%24', 'search=%7B']) {
      const response = await status('GET', '/api/menu?' + query, undefined, 200);
      assert.deepEqual(response.json, []);
    }
    for (const query of ['category=Mains&category=Drinks', 'search[x]=burger', 'price=1']) {
      await status('GET', '/api/menu?' + query, undefined, 400);
    }
    const dish = { name: 'Test dish', category: 'Mains', price: 100 };
    for (const body of [{ ...dish, _id: String(ref) }, { ...dish, price: '100' },
      { ...dish, available: 'false' }, { ...dish, category: 'All' }, { ...dish, price: 1.001 },
      { ...dish, name: ' ' }, { $set: dish }, []]) {
      await status('POST', '/api/menu', body, 400);
    }
    await status('POST', '/api/menu', '{', 400);
    const health1 = await status('GET', '/api/health', undefined, 200);
    assert.equal(health1.json.status, 'ok');
    assert.equal(new Date(health1.json.time).toISOString(), health1.json.time);
    await new Promise(resolve => setTimeout(resolve, 5));
    const health2 = await status('GET', '/api/health', undefined, 200);
    assert.notEqual(health1.json.time, health2.json.time);
    assert.equal(health2.headers.get('access-control-allow-origin'), '*');
    assert.deepEqual((await status('GET', '/api/abc', undefined, 404)).json, { message: 'Route not found' });
    const id = String(initial[0]._id);
    for (const [method, verb, route, body] of [
      ['find', 'GET', '/api/menu'],
      ['findById', 'GET', '/api/menu/' + id],
      ['create', 'POST', '/api/menu', dish],
      ['findByIdAndUpdate', 'PUT', '/api/menu/' + id, { price: 100 }],
      ['findByIdAndDelete', 'DELETE', '/api/menu/' + id],
    ]) {
      const working = MenuItem[method];
      MenuItem[method] = async () => { throw new Error('Simulated database failure'); };
      try { assert.deepEqual((await status(verb, route, body, 500)).json, { message: 'Server error' }); }
      finally { MenuItem[method] = working; }
    }
    const prototype = Object.getPrototypeOf(app.response);
    const originalJson = prototype.json;
    prototype.json = function (body) {
      if (body?.status === 'ok') throw new Error('Temporary health failure');
      return originalJson.call(this, body);
    };
    try { await status('GET', '/api/health', undefined, 500); }
    finally { prototype.json = originalJson; }
    assert.deepEqual([...records.values()], initial);
    console.log('PASS: ' + checks + ' HTTP/Postman checks; all seed models validate; original 20 items unchanged.');
    console.log('Offline persistence adapter used. Atlas connection and live seed remain unverified.');
  } finally {
    for (const method of methods) MenuItem[method] = originals[method];
    await new Promise(resolve => server.close(resolve));
  }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
