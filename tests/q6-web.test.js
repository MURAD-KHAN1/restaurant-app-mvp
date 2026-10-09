// Optional browser check. Uses a temporary Playwright installation, not app dependencies.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require(process.env.Q6_PLAYWRIGHT_PATH || (process.env.TEMP+'\\mad-q6-browser\\node_modules\\playwright'));
async function run(){
 const browser=await chromium.launch({executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true});
 const managerContext=await browser.newContext({viewport:{width:440,height:950}});
 const customerContext=await browser.newContext({viewport:{width:440,height:950}});
 const manager=await managerContext.newPage();const customer=await customerContext.newPage();
 const errors=[];for(const page of [manager,customer])page.on('pageerror',e=>errors.push(e.message));
 let checks=0;let addedId;let managerToken;let signupId;let signupEmail;
 const base=fs.readFileSync('src/api/client.js','utf8').match(/'(http:\/\/[^']+:5000\/api)'/)[1];
 const dishName='Q6 Web Test '+Date.now();
 function pass(name){checks++;console.log('PASS '+name);}
 async function login(page,email,password){
  await page.goto('http://localhost:8081',{waitUntil:'networkidle'});
  await page.getByPlaceholder('you@example.com').fill(email);
  await page.getByPlaceholder('Enter password').fill(password);
  await page.getByText('Login',{exact:true}).last().click();
 }
 async function api(method,path,body,token){
  const response=await fetch(base+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{})});
  assert(response.ok,'HTTP '+response.status);return response.json();
 }
 try{
  await login(manager,'manager@example.com','Manager123');
  await manager.getByText('Dashboard',{exact:true}).first().waitFor();pass('Manager login renders dashboard');
  managerToken=await manager.evaluate(()=>localStorage.getItem('@restaurant/auth_token'));
  assert(managerToken);pass('Manager token persisted by actual AsyncStorage web backend');
  await manager.getByText('Menu',{exact:true}).click();
  await manager.getByText('Menu Management',{exact:true}).waitFor();
  await manager.getByText('Add item',{exact:true}).click();
  await manager.getByPlaceholder('Dish name').fill(dishName);
  await manager.getByPlaceholder('Description',{exact:true}).fill('Temporary Q6 browser verification');
  await manager.getByPlaceholder('Price in PKR').fill('700');
  const addResponse=manager.waitForResponse(r=>r.url()===base+'/menu'&&r.request().method()==='POST');
  await manager.getByText('Add to menu',{exact:true}).click();
  const added=await addResponse;assert.equal(added.status(),201);addedId=(await added.json())._id;
  await manager.getByText(dishName,{exact:true}).waitFor();pass('Add action POSTs with JWT and refetches');
  await login(customer,'customer@example.com','Password123');
  await customer.getByText('Our menu',{exact:true}).waitFor();pass('Customer login renders live menu');
  await customer.getByPlaceholder('Search dishes, ingredients...').count().then(async n=>{
   if(n)await customer.getByPlaceholder('Search dishes, ingredients...').fill(dishName);
   else await customer.locator('input').first().fill(dishName);
  });
  await customer.getByText(dishName,{exact:true}).first().waitFor();
  const card=manager.getByText(dishName,{exact:true}).locator('..').locator('..');
  await card.getByPlaceholder('New price').fill('777');
  const priceResponse=manager.waitForResponse(r=>r.url()===base+'/menu/'+addedId&&r.request().method()==='PUT');
  await card.getByText('Save',{exact:true}).click();assert.equal((await priceResponse).status(),200);
  await card.getByText(/777/).first().waitFor();pass('Manager price action PUTs and displays authoritative price');
  await customer.getByLabel('Refresh menu',{exact:true}).click();
  await customer.getByText(/777/).first().waitFor();pass('Separate browser client refresh sees new price');
  await manager.reload({waitUntil:'networkidle'});
  await manager.getByText('Dashboard',{exact:true}).first().waitFor();
  await manager.getByText('Menu',{exact:true}).click();
  await manager.getByText(dishName,{exact:true}).waitFor();
  await manager.getByText(dishName,{exact:true}).locator('..').getByText(/777/).waitFor();
  pass('Menu price survives manager browser restart via server refetch');
  await manager.getByText(dishName,{exact:true}).scrollIntoViewIfNeeded();
  fs.mkdirSync('A2/screenshots',{recursive:true});
  await manager.screenshot({path:'A2/screenshots/q6-web-manager-verification.png',fullPage:true});
  await customer.screenshot({path:'A2/screenshots/q6-web-customer-verification.png',fullPage:true});
  const toggleResponse=manager.waitForResponse(r=>r.url()===base+'/menu/'+addedId&&r.request().method()==='PUT');
  await manager.getByLabel('Toggle availability for '+dishName).click();assert.equal((await toggleResponse).status(),200);
  await customer.getByLabel('Refresh menu',{exact:true}).click();
  await customer.getByText('Unavailable',{exact:true}).first().waitFor();pass('Availability action persists and other browser refresh sees it');
  await customer.reload({waitUntil:'networkidle'});
  await customer.getByText('Our menu',{exact:true}).waitFor();
  assert(await customer.evaluate(()=>Boolean(localStorage.getItem('@restaurant/auth_token'))));pass('Reload restores persisted session without manual login');
  // Simulate a temporary unavailable menu, then restore it and click Retry.
  await customer.route('**/api/menu',route=>route.abort());
  await customer.getByLabel('Refresh menu',{exact:true}).click();
  await customer.getByText('Unable to load menu',{exact:true}).waitFor();pass('Menu network error renders useful state');
  await customer.unroute('**/api/menu');
  await customer.getByText('Retry',{exact:true}).click();
  await customer.getByText('Our menu',{exact:true}).waitFor();pass('Retry reloads from server');
  await customer.getByRole('tab',{name:/Profile/}).click();
  await customer.getByText('Log out',{exact:true}).click();
  await customer.getByText('Back Welcome',{exact:true}).waitFor();
  assert.equal(await customer.evaluate(()=>localStorage.getItem('@restaurant/auth_token')),null);
  assert.equal(await customer.evaluate(()=>localStorage.getItem('@restaurant/auth_user')),null);
  await customer.reload({waitUntil:'networkidle'});await customer.getByText('Back Welcome',{exact:true}).waitFor();pass('Logout removes both persisted keys and stays logged out after reload');
  let loginError;
  customer.once('dialog',async dialog=>{loginError=dialog.message();await dialog.accept();});
  await customer.getByPlaceholder('you@example.com').fill('customer@example.com');
  await customer.getByPlaceholder('Enter password').fill('WrongPassword');
  await customer.getByText('Login',{exact:true}).last().click();
  await customer.waitForTimeout(1000);
  assert(loginError?.includes('Invalid email or password'));pass('Wrong password is shown to the user');
  await customer.getByText('Sign Up',{exact:true}).click();
  signupEmail='q6-web-'+Date.now()+'@example.com';
  await customer.getByPlaceholder('Your name').fill('Q6 Browser Customer');
  await customer.getByPlaceholder('you@example.com').fill(signupEmail);
  await customer.getByPlaceholder('Enter password').fill('Password123');
  await customer.getByPlaceholder('Repeat password').fill('Password123');
  const registerResponse=customer.waitForResponse(r=>r.url()===base+'/auth/register');
  await customer.getByText('Create Account',{exact:true}).click();
  const registered=await registerResponse;assert.equal(registered.status(),201);signupId=(await registered.json()).user._id;
  await customer.getByText('Our menu',{exact:true}).waitFor();pass('Signup UI calls backend and navigates as customer');
  await customer.route('**/api/menu',async route=>{await new Promise(resolve=>setTimeout(resolve,2000));await route.continue();});
  await customer.reload({waitUntil:'domcontentloaded'});
  await customer.getByText(/Loading our menu/).waitFor();
  pass('Initial API loading state visible while request is pending');
  await customer.getByText('Our menu',{exact:true}).waitFor();
  await customer.unroute('**/api/menu');
  assert.equal(await customer.evaluate(()=>localStorage.getItem('@restaurant/menu')),null);
  pass('Menu not persisted in AsyncStorage');
  await customer.getByRole('tab',{name:/Profile/}).click();
  await customer.getByText('Log out',{exact:true}).click();
  await customer.getByText('Back Welcome',{exact:true}).waitFor();
  await customer.getByText('Sign Up',{exact:true}).click();
  await customer.getByPlaceholder('Your name').fill('Q6 Browser Customer');
  await customer.getByPlaceholder('you@example.com').fill(signupEmail);
  await customer.getByPlaceholder('Enter password').fill('Password123');
  await customer.getByPlaceholder('Repeat password').fill('Password123');
  let duplicateMessage;
  const duplicateDialog=customer.waitForEvent('dialog');
  const duplicateResponse=customer.waitForResponse(r=>r.url()===base+'/auth/register');
  await customer.getByText('Create Account',{exact:true}).click();
  const dialog=await duplicateDialog;duplicateMessage=dialog.message();await dialog.accept();
  assert.equal((await duplicateResponse).status(),409);assert(duplicateMessage.includes('Email already registered'));
  pass('Duplicate signup 409 shown in UI');
  assert.deepEqual(errors,[]);pass('No browser runtime/module errors');
  console.log('PASS: '+checks+' Q6 browser checks. Two browser contexts tested; no physical device test claimed.');
 }finally{
  if(addedId&&managerToken)await api('DELETE','/menu/'+addedId,undefined,managerToken);
  if(signupId){
   require('../server/server');
   const mongoose=require('../server/node_modules/mongoose');
   await require('../server/config/db')();
   await require('../server/models/User').deleteOne({_id:signupId,email:signupEmail});
   await mongoose.disconnect();
  }
  await browser.close();
 }
}
run().catch(error=>{console.error(error.message);process.exitCode=1;});
