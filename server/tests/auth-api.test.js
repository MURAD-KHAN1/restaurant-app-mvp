const assert = require('node:assert/strict');
const { once } = require('node:events');
const { randomBytes } = require('node:crypto');
const vm = require('node:vm');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');
process.env.JWT_SECRET = randomBytes(32).toString('hex');
const app = require('../server');
const User = require('../models/User');
const MenuItem = require('../models/MenuItem');
const { protect, managerOnly } = require('../middleware/auth');
const seed = require('../seed');
const data = require('../data/seed-data.json');
const collection = require('../../A2/restaurant-api.postman_collection.json');
async function run() {
  const db = await MongoMemoryServer.create();
  let server;
  let checks = 0;
  function check(name, fn) { fn(); checks++; console.log('PASS: ' + name); }
  try {
    process.env.MONGO_URI = db.getUri('restaurant_app');
    await require('../config/db')();
    // Simulate one legacy Q3 plaintext account in the disposable database only.
    await User.collection.insertOne({ ...data.users[0] });
    await seed();
    const seeded = await User.find({}).select('+password');
    check('Both seeded passwords are bcrypt hashes and verify', () => {
      assert.equal(seeded.length, 2);
      for (const record of data.users) {
        const user = seeded.find(user => user.email === record.email);
        assert.notEqual(user.password, record.password);
        assert.equal(bcrypt.compareSync(record.password, user.password), true);
        assert.equal(bcrypt.getRounds(user.password), 10);
        assert.equal(user.role, record.role);
      }
    });
    await seed();
    const reseeded = await User.find({}).select('+password');
    check('Seed is repeatable and does not double-hash or replace accounts', () => {
      assert.equal(reseeded.length, 2);
      for (const user of seeded) assert.equal(reseeded.find(record => record.email === user.email).password, user.password);
    });
    server = app.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const baseUrl = 'http://127.0.0.1:' + server.address().port;
    async function request(method, path, body, token) {
      const response = await fetch(baseUrl + path, { method,
        headers: { 'Content-Type': 'application/json', ...(token ? {Authorization:'Bearer ' + token} : {}) },
        ...(body === undefined ? {} : {body:typeof body === 'string' ? body : JSON.stringify(body)}) });
      return {status:response.status, json:await response.json()};
    }
    async function status(name, method, path, body, token, expected) {
      const response = await request(method, path, body, token);
      check(name, () => assert.equal(response.status, expected));
      return response.json;
    }
    const body = {name:'Test Customer',email:' TEST@example.com ',password:'Password123'};
    const registration = await status('Registration 201','POST','/api/auth/register',body,null,201);
    check('Registration normalizes email and returns customer without password', () => {
      assert.equal(registration.user.email,'test@example.com');
      assert.equal(registration.user.role,'customer');
      assert.equal(JSON.stringify(registration).includes('password'),false);
    });
    const stored = await User.findById(registration.user._id).select('+password');
    check('Registration password is hashed in MongoDB', () => {
      assert.notEqual(stored.password,body.password);
      assert.equal(bcrypt.compareSync(body.password,stored.password),true);
      assert.equal(bcrypt.getRounds(stored.password),10);
    });
    check('Default User query and JSON serialization omit password', () => {
      assert.equal(stored.toJSON().password,undefined);
    });
    assert.equal((await User.findById(stored._id)).password,undefined);
    await status('Duplicate normalized email 409','POST','/api/auth/register',body,null,409);
    await status('Public manager role rejected 400','POST','/api/auth/register',{...body,email:'escalation@example.com',role:'manager'},null,400);
    check('Escalation did not create manager', () => assert.equal(seeded.filter(user => user.role === 'manager').length,1));
    assert.equal(await User.countDocuments({email:'escalation@example.com'}),0);
    for (const [name, input] of [['missing name',{email:'missing@example.com',password:'Password123'}],
      ['invalid email',{...body,email:'bad'}],['short password',{...body,password:'short'}],
      ['bcrypt byte limit',{...body,password:'a'.repeat(73)}],['wrong type',{...body,password:{x:1}}]]) {
      await status('Register rejects '+name,'POST','/api/auth/register',input,null,400);
    }
    const login = await status('Login normalized credentials 200','POST','/api/auth/login',{email:' TEST@EXAMPLE.COM ',password:'Password123'},null,200);
    check('Login JWT verifies and expires in exactly 86400 seconds', () => {
      const payload = jwt.verify(login.token,process.env.JWT_SECRET,{algorithms:['HS256']});
      assert.equal(payload.id,registration.user._id);
      assert.equal(payload.exp-payload.iat,86400);
      assert.deepEqual(Object.keys(payload).sort(),['exp','iat','id']);
    });
    check('Login returns name email role and no password', () => {
      assert.equal(login.user.name,'Test Customer'); assert.equal(login.user.email,'test@example.com');
      assert.equal(login.user.role,'customer'); assert.equal(JSON.stringify(login).includes('password'),false);
    });
    await status('Wrong password 401','POST','/api/auth/login',{email:'test@example.com',password:'WrongPassword'},null,401);
    await status('Unknown user 401','POST','/api/auth/login',{email:'unknown@example.com',password:'Password123'},null,401);
    await status('Missing login data 400','POST','/api/auth/login',{},null,400);
    await status('Malformed JSON 400','POST','/api/auth/login','{',null,400);
    const managerLogin = await status('Seeded manager login 200','POST','/api/auth/login',{email:data.users[1].email,password:data.users[1].password},null,200);
    const managerToken = managerLogin.token;
    const menu = await status('GET menu public 200','GET','/api/menu',undefined,null,200);
    await status('GET menu by ID public 200','GET','/api/menu/'+menu[0]._id,undefined,null,200);
    const dish = {name:'Q5 Test Burger',category:'Mains',price:700};
    await status('Menu POST no token 401','POST','/api/menu',dish,null,401);
    await status('Menu POST customer 403','POST','/api/menu',dish,login.token,403);
    const created = await status('Menu POST manager 201','POST','/api/menu',dish,managerToken,201);
    for (const method of ['PUT','DELETE']) {
      await status('Menu '+method+' no token 401',method,'/api/menu/'+created._id,method==='PUT'?{price:750}:undefined,null,401);
      await status('Menu '+method+' customer 403',method,'/api/menu/'+created._id,method==='PUT'?{price:750}:undefined,login.token,403);
    }
    await status('Invalid JWT 401','POST','/api/menu',dish,'invalid.token',401);
    const expired = jwt.sign({id:registration.user._id},process.env.JWT_SECRET,{expiresIn:-1});
    await status('Expired JWT 401','POST','/api/menu',dish,expired,401);
    const wrong = jwt.sign({id:registration.user._id},'different-test-secret',{expiresIn:'1d'});
    await status('Wrong JWT signature 401','POST','/api/menu',dish,wrong,401);
    const gone = jwt.sign({id:String(new mongoose.Types.ObjectId())},process.env.JWT_SECRET,{expiresIn:'1d'});
    await status('Deleted or unknown JWT user 401','POST','/api/menu',dish,gone,401);
    const malformed = jwt.sign({id:'abc'},process.env.JWT_SECRET,{expiresIn:'1d'});
    await status('Malformed JWT user ID 401','POST','/api/menu',dish,malformed,401);
    let protectedUser;
    const req = {get:()=> 'Bearer '+managerToken};
    await protect(req,{status:()=> {throw new Error('Unexpected auth failure');}},()=> {protectedUser=req.user;});
    check('protect attaches current user without password', () => {
      assert.equal(protectedUser.role,'manager'); assert.equal(protectedUser.password,undefined);
    });
    let missingUserStatus;
    managerOnly({}, {status:code=> {missingUserStatus=code;return {json:()=>{}};}},()=> {throw new Error('Unexpected allow');});
    check('managerOnly requires authenticated user',()=>assert.equal(missingUserStatus,401));
    await User.updateOne({_id:managerLogin.user._id},{$set:{role:'customer'}});
    await status('Current DB role overrides existing manager token 403','POST','/api/menu',dish,managerToken,403);
    await User.updateOne({_id:managerLogin.user._id},{$set:{role:'manager'}});
    await status('Manager PUT 200','PUT','/api/menu/'+created._id,{price:750},managerToken,200);
    await status('Manager DELETE 200','DELETE','/api/menu/'+created._id,undefined,managerToken,200);
    // Execute the real Q5 Postman scripts against HTTP, with tokens from login responses.
    const variables = Object.fromEntries(collection.variable.map(v=>[v.key,v.value]));
    variables.baseUrl=baseUrl;
    const expand=value=>value.replace(/\{\{(\w+)\}\}/g,(_,key)=>variables[key]);
    for (const item of collection.item.find(group=>group.name==='Question 5 Auth and Protected Routes').item) {
      const pm = { collectionVariables:{set:(key,value)=>{variables[key]=value;}},
        test:(name,fn)=>check('Postman '+item.name+': '+name,fn),
        expect:value=>({to:{equal:expected=>assert.equal(value,expected)}}) };
      for (const event of item.event.filter(event=>event.listen==='prerequest')) vm.runInNewContext(event.script.exec.join('\n'),{pm});
      const req=item.request;
      const token=req.auth?.type==='bearer'?expand(req.auth.bearer[0].value):undefined;
      const response=await request(req.method,expand(req.url).slice(baseUrl.length),req.body?expand(req.body.raw):undefined,token);
      pm.response={json:()=>response.json,to:{have:{status:expected=>assert.equal(response.status,expected)}}};
      for (const event of item.event.filter(event=>event.listen==='test')) vm.runInNewContext(event.script.exec.join('\n'),{pm});
    }
    const count = await MenuItem.countDocuments();
    check('All temporary menu items cleaned up; original menu retained',()=>assert.equal(count,20));
    console.log('PASS: '+checks+' Q5 automated checks against actual isolated MongoDB.');
  } finally {
    if (server) await new Promise(resolve=>server.close(resolve));
    await mongoose.disconnect();
    await db.stop();
  }
}
run().catch(error=>{console.error(error);process.exitCode=1;});
