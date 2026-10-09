// Real HTTP checks: offline adapter by default, actual temporary MongoDB with --integration.
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { once } = require('node:events');
const mongoose = require('mongoose');
const app = require('../server');
const MenuItem = require('../models/MenuItem');
const data = require('../data/seed-data.json');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('node:crypto');
process.env.JWT_SECRET = randomBytes(32).toString('hex');
const collection = require('../../A2/restaurant-api.postman_collection.json');

async function run() {
  for (const record of data.menuItems) await new MenuItem(record).validate();
  const integration = process.argv.includes('--integration');
  let mongod;
  if (integration) {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongod = await MongoMemoryServer.create();
    process.env.MONGO_URI = mongod.getUri('restaurant_app');
    await require('../config/db')();
    await require('../seed')();
    await require('../seed')();
  }
  const originalUserFind = User.findById;
  const manager = integration ? await User.findOne({ role: 'manager' })
    : { _id: new mongoose.Types.ObjectId(), name: 'Test Manager', email: 'manager@example.com', role: 'manager' };
  if (!integration) User.findById = () => ({ select: async () => manager });
  const managerToken = jwt.sign({ id: String(manager._id) }, process.env.JWT_SECRET, { expiresIn: '1d' });
  const ref = new mongoose.Types.ObjectId();
  const initial = integration ? (await MenuItem.find({})).map(doc => doc.toObject())
    : data.menuItems.map(record => new MenuItem(record).toObject());
  const records = new Map(initial.map(item => [String(item._id), item]));
  const methods = ['find', 'findById', 'create', 'findByIdAndUpdate', 'findByIdAndDelete'];
  const originals = Object.fromEntries(methods.map(method => [method, MenuItem[method]]));
  if (!integration) {
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
    assert.equal(options.returnDocument, 'after');
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
  }
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const baseUrl = 'http://127.0.0.1:' + server.address().port;
  let checks = 0;
  async function request(method, route, body) {
    const response = await fetch(baseUrl + route, {
      method, headers: { 'Content-Type': 'application/json',
        ...(['POST', 'PUT', 'DELETE'].includes(method) ? { Authorization: 'Bearer ' + managerToken } : {}) },
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
    for (const item of collection.item.filter(group => group.name === 'Question 4 Menu API').flatMap(group => group.item)) {
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
      if (/^0[123] /.test(item.name)) assert(response.json.length > 0, item.name + ' must return seeded data');
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
      { ...dish, available: 'false' }, { ...dish, category: 'All' }, 
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
    if (integration) {
      const stored = await MenuItem.find({});
      assert.equal(stored.length, data.menuItems.length);
      for (const record of data.menuItems) {
        const item = stored.find(item => item.name === record.name);
        for (const [key, value] of Object.entries(record)) assert.equal(item[key], value);
      }
    } else assert.deepEqual([...records.values()], initial);
    console.log('PASS: ' + checks + ' HTTP/Postman checks; menu seed validates; original 20 items unchanged.');
    console.log(integration ? 'Real temporary MongoDB integration verified; Atlas was not used by automated tests.' : 'Offline persistence adapter used; run npm run test:integration for real MongoDB checks.');
  } finally {
    User.findById = originalUserFind;
    for (const method of methods) MenuItem[method] = originals[method];
    await new Promise(resolve => server.close(resolve));
    if (mongod) { await mongoose.disconnect(); await mongod.stop(); }
  }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
