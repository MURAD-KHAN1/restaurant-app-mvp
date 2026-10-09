// Optional browser integration check; Playwright stays outside app dependencies.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require(process.env.Q7_PLAYWRIGHT_PATH || process.env.TEMP+'\\mad-q6-browser\\node_modules\\playwright');
const base=fs.readFileSync('src/api/client.js','utf8').match(/'(http:\/\/[^']+:5000\/api)'/)[1];
async function run(){
 const browser=await chromium.launch({executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true});
 const contexts=await Promise.all([browser.newContext({viewport:{width:440,height:950}}),browser.newContext({viewport:{width:440,height:950}})]);
 const [customer,manager]=await Promise.all(contexts.map(c=>c.newPage()));
 const errors=[],dialogs=[],polls=[];let checks=0,orderId,reservationId;
 for(const page of [customer,manager]){page.on('pageerror',e=>errors.push(e.message));page.on('dialog',async d=>{dialogs.push(d.message());await d.accept();});}
 customer.on('request',r=>{if(r.url()===base+'/orders/my')polls.push(Date.now());});
 function pass(name){checks++;console.log('PASS '+name);}
 async function login(page,email,password){await page.goto('http://localhost:8081',{waitUntil:'networkidle'});await page.getByPlaceholder('you@example.com').fill(email);await page.getByPlaceholder('Enter password').fill(password);await page.getByText('Login',{exact:true}).last().click();}
 const guest='Q7 Browser Guest '+Date.now();
 try{
  await login(customer,'customer@example.com','Password123');await customer.getByText('Our menu',{exact:true}).waitFor();pass('Customer login and live menu');
  await login(manager,'manager@example.com','Manager123');await manager.getByText('Dashboard',{exact:true}).first().waitFor();pass('Manager login');
  await customer.getByText('Add to cart',{exact:true}).first().click();await customer.getByRole('tab',{name:/Cart/}).click();await customer.getByText('Review order',{exact:true}).waitFor();pass('Cart accepts live menu item');
  await customer.getByText('Review order',{exact:true}).click();await customer.getByText('Takeaway',{exact:true}).click();
  await customer.route('**/api/orders',route=>route.request().method()==='POST'?route.fulfill({status:400,contentType:'application/json',body:JSON.stringify({message:'Q7 simulated unavailable item'})}):route.continue());
  const rejected=customer.waitForResponse(r=>r.url()===base+'/orders'&&r.request().method()==='POST');await customer.getByText('Confirm order',{exact:true}).click();assert.equal((await rejected).status(),400);
  await customer.getByLabel('Back to cart',{exact:true}).click();await customer.getByText('Review order',{exact:true}).waitFor();assert(dialogs.some(d=>d.includes('Q7 simulated unavailable item')));pass('Checkout failure shows server error and retains cart');
  await customer.unroute('**/api/orders');await customer.getByText('Review order',{exact:true}).click();await customer.getByText('Takeaway',{exact:true}).click();
  const placed=customer.waitForResponse(r=>r.url()===base+'/orders'&&r.request().method()==='POST');await customer.getByText('Confirm order',{exact:true}).click();const response=await placed;assert.equal(response.status(),201);const order=await response.json();orderId=order._id;
  assert.equal(order.total,Math.round((order.subtotal+order.serviceCharge+order.salesTax-order.discount)*100)/100);assert(!Object.hasOwn(response.request().postDataJSON(),'total'));pass('Checkout POST sends IDs only and displays server order');
  const customerTop=()=>customer.getByText(orderId,{exact:true}).locator('..').locator('..');await customerTop().getByText('Pending',{exact:true}).waitFor();
  const start=polls.length;await customer.waitForTimeout(11000);assert(polls.length>start);assert(polls.slice(start).some((t,i)=>t-(polls[start+i-1]||polls[start-1])>=9000));await customerTop().getByText('Pending',{exact:true}).waitFor();pass('10-second server polling; Pending never advances locally');
  await manager.getByLabel('Refresh manager orders').click();const managerCard=()=>manager.getByText(orderId,{exact:true}).locator('..').locator('..').locator('..');await managerCard().getByText('Mark Preparing',{exact:true}).waitFor();pass('Separate manager client reads new database order');
  for(const next of ['Preparing','Ready']){const changed=manager.waitForResponse(r=>r.url()===base+'/orders/'+orderId+'/status'&&r.request().method()==='PATCH');await managerCard().getByText('Mark '+next,{exact:true}).click();assert.equal((await changed).status(),200);await managerCard().getByText(next,{exact:true}).waitFor();pass('Manager PATCH and refetch '+next);}
  await customerTop().getByText('Ready',{exact:true}).waitFor({timeout:15000});pass('Customer sees Ready through polling without restart or refresh');
  await customer.getByRole('tab',{name:/Cart/}).click();await customer.getByText('Your cart is empty',{exact:true}).filter({visible:true}).waitFor();pass('Successful order clears cart');
  const afterBlur=polls.length;await customer.waitForTimeout(11000);assert.equal(polls.length,afterBlur);pass('Orders interval cleaned up on tab blur');
  await customer.getByRole('tab',{name:/Reserve/}).click();await customer.getByPlaceholder('Full name').fill(guest);await customer.getByPlaceholder('03XX-XXXXXXX').fill('0300-1234567');await customer.getByPlaceholder('YYYY-MM-DD').fill(new Date(Date.now()+4*86400000).toISOString().slice(0,10));
  await customer.waitForResponse(r=>r.url().includes('/tables?')&&r.status()===200);await customer.getByText('Request reservation',{exact:true}).click();await customer.getByText('Confirm',{exact:true}).waitFor();
  const booked=customer.waitForResponse(r=>r.url()===base+'/reservations'&&r.request().method()==='POST');await customer.getByText('Confirm',{exact:true}).click();const bookingResponse=await booked;assert.equal(bookingResponse.status(),201);reservationId=(await bookingResponse.json())._id;pass('Customer submits reservation to server');
  await customer.getByText('Pending',{exact:true}).first().waitFor();pass('My Reservations renders persisted Pending booking');
  await manager.getByText('Reservations',{exact:true}).first().click();await manager.getByLabel('Refresh manager reservations').click();const bookingCard=()=>manager.getByText(guest,{exact:true}).locator('..').locator('..').locator('..').locator('..');await bookingCard().getByText('Accept',{exact:true}).waitFor();pass('Manager sees customer booking');
  const accepted=manager.waitForResponse(r=>r.url()===base+'/reservations/'+reservationId&&r.request().method()==='PATCH');await bookingCard().getByText('Accept',{exact:true}).click();assert.equal((await accepted).status(),200);await bookingCard().getByText('Accepted',{exact:true}).waitFor();pass('Manager accepts and refetches reservation');
  await customer.getByLabel('Refresh reservations').click();await customer.getByText('Accepted',{exact:true}).first().waitFor();pass('Customer refresh sees Accepted');
  await customer.reload({waitUntil:'networkidle'});await customer.getByText('Our menu',{exact:true}).waitFor();await customer.getByRole('tab',{name:/Orders/}).click();await customerTop().getByText('Ready',{exact:true}).waitFor();pass('Order survives app reload via authenticated server fetch');
  assert.deepEqual(errors,[]);pass('No browser runtime errors');console.log('PASS: '+checks+' Q7 browser checks across two independent sessions (not physical devices).');
 } finally {
  await browser.close();
  if(orderId||reservationId){require('../server/node_modules/dotenv').config({path:'server/.env',quiet:true});const mongoose=require('../server/node_modules/mongoose');await mongoose.connect(process.env.MONGO_URI);try{if(orderId)await require('../server/models/Order').deleteOne({_id:orderId,customerEmail:'customer@example.com'});if(reservationId)await require('../server/models/Reservation').deleteOne({_id:reservationId,customerName:guest});}finally{await mongoose.disconnect();}}
 }
}
run().catch(e=>{console.error(e);process.exitCode=1;});
