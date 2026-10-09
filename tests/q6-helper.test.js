const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const babel = require('@babel/core');
const { once } = require('node:events');
const { randomBytes } = require('node:crypto');
function load(file, cache = {}) {
  const filename = path.resolve(__dirname, '..', file);
  if (cache[filename]) return cache[filename].exports;
  const module = {exports:{}}; cache[filename]=module;
  const code = babel.transformSync(fs.readFileSync(filename,'utf8'),{configFile:false,babelrc:false,
    plugins:[require.resolve('@babel/plugin-transform-modules-commonjs')]}).code;
  vm.runInThisContext('(function(require,module,exports){'+code+'\n})',{filename})(specifier=>{
    if (/\.(jpg|png)$/.test(specifier)) return specifier;
    if(specifier.startsWith('.')) return load(path.relative(path.resolve(__dirname,'..'),path.resolve(path.dirname(filename),specifier+'.js')),cache);
    return require(specifier);
  },module,module.exports);
  return module.exports;
}
async function main() {
  let checks=0;
  function check(name,fn){fn();checks++;console.log('PASS '+name);}
  const {apiRequest}=load('src/api/client.js');
  const {saveSession,readSession,clearSession,AUTH_KEYS}=load('src/api/session.js');
  const {normalizeMenu}=load('src/api/menu.js');
  const realFetch=global.fetch;
  try {
    let headers;
    global.fetch=async(url,options)=>{headers=options.headers;return new Response(JSON.stringify({ok:true}),{status:200});};
    check('JSON success parses',()=>{}); assert.deepEqual(await apiRequest('/health'),{ok:true});
    check('Public request has no auth',()=>assert.equal(headers.Authorization,undefined));
    await apiRequest('/menu',{method:'POST',body:{name:'Dish'}},'test-only-token');
    check('Bearer token and JSON header',()=>{assert.equal(headers.Authorization,'Bearer test-only-token');assert.equal(headers['Content-Type'],'application/json');});
    global.fetch=async()=>new Response(null,{status:204});
    assert.equal(await apiRequest('/empty'),null);check('Empty response supported',()=>{});
    global.fetch=async()=>new Response(JSON.stringify({message:'Email already registered'}),{status:409});
    await assert.rejects(apiRequest('/auth/register'),error=>error.status===409&&error.message==='Email already registered');check('Server error message/status preserved',()=>{});
    global.fetch=async()=>new Response('<html>Error</html>',{status:500});
    await assert.rejects(apiRequest('/menu'),error=>error.status===500&&!error.message.includes('<html>'));check('Non-JSON failures are safe',()=>{});
    global.fetch=async()=>new Response('bad JSON',{status:200});
    await assert.rejects(apiRequest('/menu'),/invalid response/);check('Invalid success JSON handled',()=>{});
    global.fetch=async()=>{throw new TypeError('network');};
    await assert.rejects(apiRequest('/menu'),/Cannot reach the server/);check('Network failures are useful',()=>{});
    global.fetch=async(url,{signal})=>new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(new Error('Aborted'))));
    await assert.rejects(apiRequest('/menu',{timeout:5}),/too long/);check('Timeout handled',()=>{});
  } finally {global.fetch=realFetch;}
  const values=new Map();
  const storage={multiSet:async entries=>entries.forEach(([k,v])=>values.set(k,v)),
    multiGet:async keys=>keys.map(k=>[k,values.get(k)||null]),multiRemove:async keys=>keys.forEach(k=>values.delete(k))};
  const response={token:'test-only-token',user:{_id:'id1',name:'User',email:'user@example.com',role:'customer',password:'must-be-dropped'}};
  await saveSession(storage,response);
  const restored=await readSession(storage);
  check('Token and user survive reload helper',()=>{assert.equal(restored.token,response.token);assert.equal(restored.user.id,'id1');assert.equal(restored.user.password,undefined);assert.equal(values.size,2);});
  await clearSession(storage);check('Logout removes both keys',()=>AUTH_KEYS.forEach(k=>assert.equal(values.has(k),false)));
  values.set(AUTH_KEYS[0],'stale');values.set(AUTH_KEYS[1],'{');
  assert.equal(await readSession(storage),null);check('Corrupt stored session discarded',()=>assert.equal(values.size,0));
  const failing={...storage,multiSet:async()=>{values.set(AUTH_KEYS[0],'partial');throw new Error('Disk full');}};
  await assert.rejects(saveSession(failing,response),/Could not save/);check('Partial session rollback',()=>assert.equal(values.size,0));
  const normalized=normalizeMenu([{_id:'menu1',name:'Dish',category:'Mains',price:700,available:false}])[0];
  check('Server shape normalized with safe optional fields',()=>{assert.equal(normalized.id,'menu1');assert.equal(normalized.isAvailable,false);assert.equal(normalized.description,'');assert.equal(normalized.image,null);});
  check('Unknown response shape rejected',()=>assert.throws(()=>normalizeMenu({}),/invalid menu/));
  const {MongoMemoryServer}=require('../server/node_modules/mongodb-memory-server');
  const mongoose=require('../server/node_modules/mongoose');
  const db=await MongoMemoryServer.create({binary:{downloadDir:path.resolve(__dirname,'../server/node_modules/.cache/mongodb-memory-server')}});
  let server;
  const savedEnv={url:process.env.EXPO_PUBLIC_API_URL,mongo:process.env.MONGO_URI,jwt:process.env.JWT_SECRET};
  try {
    process.env.MONGO_URI=db.getUri('restaurant_app');process.env.JWT_SECRET=randomBytes(32).toString('hex');
    const app=require('../server/server');
    await require('../server/config/db')();await require('../server/seed')();
    server=app.listen(0,'127.0.0.1');await once(server,'listening');
    process.env.EXPO_PUBLIC_API_URL='http://127.0.0.1:'+server.address().port+'/api';
    const client=load('src/api/client.js');
    const registered=await client.apiRequest('/auth/register',{method:'POST',body:{name:'Q6 Test',email:'q6@example.com',password:'Password123'}});
    check('Signup client integrates with actual auth response',()=>assert.equal(registered.user.role,'customer'));
    await saveSession(storage,registered);assert.equal((await readSession(storage)).token,registered.token);
    const manager=await client.apiRequest('/auth/login',{method:'POST',body:{email:'manager@example.com',password:'Manager123'}});
    const customer=await client.apiRequest('/auth/login',{method:'POST',body:{email:'customer@example.com',password:'Password123'}});
    check('Both seeded logins work through client',()=>{assert.equal(manager.user.role,'manager');assert.equal(customer.user.role,'customer');});
    const menu=normalizeMenu(await client.apiRequest('/menu'));
    check('Public server menu normalizes',()=>assert.equal(menu.length,20));
    const dish=await client.apiRequest('/menu',{method:'POST',body:{name:'Q6 Test Dish',category:'Mains',price:700}},manager.token);
    check('Manager add reaches server',()=>assert(dish._id));
    await client.apiRequest('/menu/'+dish._id,{method:'PUT',body:{price:777}},manager.token);
    const secondClient=load('src/api/client.js');
    const changed=normalizeMenu(await secondClient.apiRequest('/menu')).find(item=>item.id===dish._id);
    check('Independent fresh request sees changed server price',()=>assert.equal(changed.price,777));
    await client.apiRequest('/menu/'+dish._id,{method:'PUT',body:{available:false}},manager.token);
    check('Availability is persisted by server',()=>{});
    assert.equal(normalizeMenu(await secondClient.apiRequest('/menu')).find(item=>item.id===dish._id).isAvailable,false);
    await assert.rejects(client.apiRequest('/menu',{method:'POST',body:{name:'Rejected',category:'Mains',price:1}},customer.token),error=>error.status===403);check('Customer mutation forbidden through client',()=>{});
    await client.apiRequest('/menu/'+dish._id,{method:'DELETE'},manager.token);
    check('Manager delete cleans up item',()=>{});assert.equal((await client.apiRequest('/menu')).length,20);
  } finally {
    if(server)await new Promise(resolve=>server.close(resolve));
    await mongoose.disconnect();await db.stop();
    for(const [key,value] of [['EXPO_PUBLIC_API_URL',savedEnv.url],['MONGO_URI',savedEnv.mongo],['JWT_SECRET',savedEnv.jwt]]) {if(value===undefined)delete process.env[key];else process.env[key]=value;}
  }
  console.log('PASS: '+checks+' Q6 helper/integration checks; disposable database removed.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
