const assert = require('node:assert/strict');
const { once } = require('node:events');
const { randomBytes } = require('node:crypto');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
process.env.JWT_SECRET = randomBytes(32).toString('hex');
const app = require('../server');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
async function run() {
  const db = await MongoMemoryServer.create();
  let server; let checks = 0;
  function check(name, fn) { fn(); checks++; console.log('PASS: ' + name); }
  try {
    process.env.MONGO_URI = db.getUri('restaurant_app');
    await require('../config/db')(); await require('../seed')();
    server = app.listen(0, '127.0.0.1'); await once(server, 'listening');
    const base = 'http://127.0.0.1:' + server.address().port;
    async function request(method, url, body, token) {
      const response = await fetch(base + url, { method, headers: { 'Content-Type': 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {}) },
        ...(body === undefined ? {} : { body: typeof body === 'string' ? body : JSON.stringify(body) }) });
      return { status: response.status, json: await response.json() };
    }
    async function status(name, method, url, body, token, expected) {
      const response = await request(method, url, body, token);
      check(name, () => assert.equal(response.status, expected)); return response.json;
    }
    const customer = (await request('POST', '/api/auth/login', {email:'customer@example.com',password:'Password123'})).json;
    const manager = (await request('POST', '/api/auth/login', {email:'manager@example.com',password:'Manager123'})).json;
    const other = (await request('POST','/api/auth/register',{name:'Other Customer',email:'other@example.com',password:'Password123'})).json;
    const ct = customer.token; const mt = manager.token; const ot = other.token;
    const dish = await MenuItem.create({name:'Q7 Priced Dish',category:'Mains',price:129.99});
    const unavailable = await MenuItem.create({name:'Unavailable Q7 Dish',category:'Mains',price:50,available:false});
    const orderBody = {items:[{menuItem:String(dish._id),quantity:2,note:'No chilli',price:1}],orderType:'Takeaway',pickupTime:'15 minutes',total:1,subtotal:1,discount:999999};
    const first = await status('Customer order creation 201','POST','/api/orders',orderBody,ct,201);
    check('Database price controls snapshots and totals; fake totals ignored',()=>{
      assert.equal(first.subtotal,259.98);assert.equal(first.serviceCharge,13);assert.equal(first.salesTax,39);
      assert.equal(first.discount,0);assert.equal(first.total,311.98);assert.equal(first.items[0].unitPrice,129.99);
      assert.equal(first.items[0].name,dish.name);assert.equal(first.items[0].note,'No chilli');
      assert.equal(first.user,customer.user._id);assert.equal(first.status,'Pending');assert(first.createdAt&&first.updatedAt);
    });
    const second = await status('Second customer order creation 201','POST','/api/orders',orderBody,ot,201);
    const my = await status('Customer my orders 200','GET','/api/orders/my?user='+other.user._id,undefined,ct,200);
    check('Order ownership comes from JWT, not supplied query',()=>{assert.equal(my.length,1);assert.equal(my[0]._id,first._id);});
    await status('Customer cannot list all orders','GET','/api/orders',undefined,ct,403);
    const all = await status('Manager lists all orders','GET','/api/orders',undefined,mt,200);
    check('Manager sees both customer orders',()=>assert.equal(all.length,2));
    const promo = await status('Validated existing promo allowed','POST','/api/orders',{...orderBody,promoCode:'WELCOME10'},ct,201);
    check('Server calculates discount too',()=>{assert.equal(promo.discount,26);assert.equal(promo.total,285.98);});
    const tables = await status('Authenticated tables available','GET','/api/tables',undefined,ct,200);
    check('Original six table capacities retained',()=>assert.deepEqual(tables.map(t=>t.seats),[2,4,4,6,8,12]));
    await status('Dine-in table validated','POST','/api/orders',{items:[{menuItem:String(dish._id),quantity:1}],orderType:'Dine-in',table:tables[0]._id},ct,201);
    for (const [name,body,expected] of [
      ['Unavailable menu rejected',{...orderBody,items:[{menuItem:String(unavailable._id),quantity:1}]},400],
      ['Missing menu item rejected',{...orderBody,items:[{menuItem:String(new mongoose.Types.ObjectId()),quantity:1}]},404],
      ['Invalid menu ID',{...orderBody,items:[{menuItem:'abc',quantity:1}]},400],
      ['Zero quantity',{...orderBody,items:[{menuItem:String(dish._id),quantity:0}]},400],
      ['Fractional quantity',{...orderBody,items:[{menuItem:String(dish._id),quantity:1.5}]},400],
      ['String quantity',{...orderBody,items:[{menuItem:String(dish._id),quantity:'2'}]},400],
      ['Duplicate menu lines',{...orderBody,items:[{menuItem:String(dish._id),quantity:1},{menuItem:String(dish._id),quantity:2}]},400],
      ['Empty order',{...orderBody,items:[]},400],
      ['Invalid promo',{...orderBody,promoCode:'FREE999'},400],
      ['Invalid pickup',{...orderBody,pickupTime:'now'},400],
      ['Invalid table',{...orderBody,orderType:'Dine-in',table:'abc'},400],
      ['Missing table',{...orderBody,orderType:'Dine-in',table:String(new mongoose.Types.ObjectId())},404],
      ['Client user injection',{...orderBody,user:other.user._id},400],
    ]) await status(name,'POST','/api/orders',body,ct,expected);
    check('Rejected orders were not saved',()=>{});assert.equal(await Order.countDocuments(),4);
    await status('Customer cannot change order status','PATCH','/api/orders/'+first._id+'/status',{status:'Preparing'},ct,403);
    await status('Pending to Preparing','PATCH','/api/orders/'+first._id+'/status',{status:'Preparing'},mt,200);
    for(const state of ['Pending','Cancelled','Served','Unknown'])await status('Preparing to '+state+' rejected','PATCH','/api/orders/'+first._id+'/status',{status:state},mt,400);
    await status('Preparing to Ready','PATCH','/api/orders/'+first._id+'/status',{status:'Ready'},mt,200);
    for(const state of ['Preparing','Cancelled'])await status('Ready to '+state+' rejected','PATCH','/api/orders/'+first._id+'/status',{status:state},mt,400);
    await status('Ready to Served','PATCH','/api/orders/'+first._id+'/status',{status:'Served'},mt,200);
    await status('Served to Ready rejected','PATCH','/api/orders/'+first._id+'/status',{status:'Ready'},mt,400);
    await status('Pending cancellation allowed','PATCH','/api/orders/'+second._id+'/status',{status:'Cancelled'},mt,200);
    await status('Cancelled is terminal','PATCH','/api/orders/'+second._id+'/status',{status:'Preparing'},mt,400);
    await status('Invalid order ID 400','PATCH','/api/orders/abc/status',{status:'Preparing'},mt,400);
    await status('Missing order 404','PATCH','/api/orders/'+new mongoose.Types.ObjectId()+'/status',{status:'Preparing'},mt,404);
    await MenuItem.updateOne({_id:dish._id},{$set:{price:500}});
    check('Price snapshot remains after menu price changes',()=>{});assert.equal((await Order.findById(first._id)).items[0].unitPrice,129.99);
    const date = new Date(Date.now()+3*86400000).toISOString().slice(0,10);
    const booking = {table:tables[0]._id,date,time:'19:00',partySize:2,phone:'0300-1234567',customerName:'Booking Guest'};
    const reservation = await status('Customer reservation 201','POST','/api/reservations',booking,ct,201);
    check('Reservation keeps timestamp, owner and populated table',()=>{assert.equal(reservation.user,customer.user._id);assert.equal(reservation.table.seats,2);assert(reservation.createdAt&&reservation.updatedAt);});
    await status('Insufficient capacity 400','POST','/api/reservations',{...booking,table:tables[0]._id,time:'18:00',partySize:3},ct,400);
    await status('Duplicate active slot 409','POST','/api/reservations',booking,ot,409);
    for (const [name,body,expected] of [
      ['Missing table 404',{...booking,table:String(new mongoose.Types.ObjectId())},404],
      ['Invalid table ID 400',{...booking,table:'abc'},400],
      ['Invalid party size 400',{...booking,partySize:0},400],
      ['Invalid date 400',{...booking,date:'2030-02-30'},400],
      ['Past slot 400',{...booking,date:'2000-01-01'},400],
      ['Invalid time 400',{...booking,time:'25:00'},400],
      ['Invalid phone 400',{...booking,phone:'bad'},400],
      ['Client owner injection 400',{...booking,user:other.user._id},400],
    ])await status(name,'POST','/api/reservations',body,ct,expected);
    const otherBooking = await status('Other customer different table 201','POST','/api/reservations',{...booking,table:tables[1]._id},ot,201);
    const mine = await status('My reservations 200','GET','/api/reservations/my?user='+other.user._id,undefined,ct,200);
    check('Reservation ownership derives from JWT only',()=>{assert.equal(mine.length,1);assert.equal(mine[0]._id,reservation._id);});
    await status('Customer cannot list all reservations','GET','/api/reservations',undefined,ct,403);
    const list = await status('Manager lists all reservations','GET','/api/reservations',undefined,mt,200);
    check('Manager sees both bookings',()=>assert.equal(list.length,2));
    await status('Customer cannot accept','PATCH','/api/reservations/'+reservation._id,{status:'Accepted'},ct,403);
    await status('Customer cannot decline','PATCH','/api/reservations/'+reservation._id,{status:'Declined'},ct,403);
    await status('Other customer cannot cancel','PATCH','/api/reservations/'+reservation._id,{status:'Cancelled'},ot,403);
    await status('Manager accepts','PATCH','/api/reservations/'+reservation._id,{status:'Accepted'},mt,200);
    await status('Accepted slot still blocked','POST','/api/reservations',booking,ot,409);
    await status('Manager declines','PATCH','/api/reservations/'+otherBooking._id,{status:'Declined'},mt,200);
    const rebook = await status('Declined frees slot','POST','/api/reservations',{...booking,table:tables[1]._id},ot,201);
    await status('Owner cancels accepted booking','PATCH','/api/reservations/'+reservation._id,{status:'Cancelled'},ct,200);
    await status('Cancelled frees slot','POST','/api/reservations',booking,ot,201);
    await status('Cancelled cannot be reopened','PATCH','/api/reservations/'+reservation._id,{status:'Accepted'},mt,400);
    await status('Invalid reservation ID','PATCH','/api/reservations/abc',{status:'Accepted'},mt,400);
    await status('Missing reservation','PATCH','/api/reservations/'+new mongoose.Types.ObjectId(),{status:'Accepted'},mt,404);
    await status('Invalid reservation status','PATCH','/api/reservations/'+rebook._id,{status:'Ready'},mt,400);
    const simultaneous = await Promise.all([request('POST','/api/reservations',{...booking,time:'20:00'},ct),request('POST','/api/reservations',{...booking,time:'20:00'},ot)]);
    check('Concurrent same-slot bookings yield one 201 and one 409',()=>assert.deepEqual(simultaneous.map(r=>r.status).sort(),[201,409]));
    const available = await status('Table availability consults all customers','GET','/api/tables?date='+date+'&time=20%3A00&partySize=2',undefined,ct,200);
    check('Occupied table excluded from server availability',()=>assert(!available.some(t=>t._id===tables[0]._id)));
    for (const path of ['/api/orders/my','/api/orders','/api/reservations/my','/api/reservations','/api/tables']) {
      await status('Missing token '+path,'GET',path,undefined,null,401);
      await status('Invalid token '+path,'GET',path,undefined,'invalid',401);
    }
    await status('No token order POST','POST','/api/orders',orderBody,null,401);
    await status('No token booking POST','POST','/api/reservations',booking,null,401);
    await status('Manager cannot place customer order','POST','/api/orders',orderBody,mt,403);
    await status('Manager cannot create customer reservation','POST','/api/reservations',booking,mt,403);
    await status('Malformed JSON','POST','/api/orders','{',ct,400);
    const vm = require('node:vm');
    const collection = JSON.parse(require('node:fs').readFileSync(require('node:path').join(__dirname,'../../A2/restaurant-api.postman_collection.json'),'utf8'));
    const variables = {baseUrl:base};
    const resolve = text => text.replace(/\{\{([^}]+)\}\}/g,(_,key)=>variables[key] || '');
    for(const entry of collection.item.find(folder=>folder.name==='Question 7 Orders and Reservations').item) {
      const r=entry.request;
      const token=r.auth.type==='bearer'?resolve(r.auth.bearer[0].value):null;
      const response=await request(r.method,resolve(r.url).replace(base,''),r.body?JSON.parse(resolve(r.body.raw)):undefined,token);
      const pm={response:{json:()=>response.json,to:{have:{status:expected=>assert.equal(response.status,expected,entry.name)}}},
        collectionVariables:{set:(key,value)=>{variables[key]=value;},get:key=>variables[key]},
        expect:actual=>({to:{equal:expected=>assert.equal(actual,expected)}}),test:(name,fn)=>check('Postman '+entry.name+' / '+name,fn)};
      for(const event of entry.event || [])if(event.listen==='test')vm.runInNewContext(event.script.exec.join('\n'),{pm,Date});
    }
    console.log('PASS: '+checks+' Q7 HTTP/business-rule checks against real disposable MongoDB.');
  } finally {if(server)await new Promise(resolve=>server.close(resolve));await mongoose.disconnect();await db.stop();}
}
run().catch(error=>{console.error(error);process.exitCode=1;});
