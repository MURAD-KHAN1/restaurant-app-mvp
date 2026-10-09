# Assignment 2 Question 4: Menu API

Objective: restore the existing Express backend and implement/test menu CRUD, category filters, and case-insensitive name search. A1 frontend and Q5-Q7 were not changed.

Recovered missing files: server/config/db.js, server/server.js, server/controllers/menuController.js, server/routes/menuRoutes.js, server/seed.js, server/tests/menu-api.test.js. Added server/tests/dev-startup.test.js, server/.env (blank private URI), this document, and Q4_SCREENSHOT_INSTRUCTIONS.md. Updated server/package.json, server/package-lock.json, server/.env.example, A2/restaurant-api.postman_collection.json, and the previous Q4-menu-api.md handoff. Existing MenuItem model and seed-data.json were reused unchanged.

| Request | Success |
| --- | --- |
| GET /api/menu | 200, all menu items |
| GET /api/menu?category=Mains | 200, matching category |
| GET /api/menu?search=burger | 200, case-insensitive name substring |
| GET /api/menu/:id | 200, item |
| POST /api/menu | 201, created item |
| PUT /api/menu/:id | 200, updated item |
| DELETE /api/menu/:id | 200, deletion message |

Category and search combine. PUT accepts partial updates and uses runValidators: true. Routes only map controller functions. Controllers use try/catch and keep all menu database queries out of routes. JSON status codes: 400 invalid/missing data or malformed ID; 404 missing item/route; 500 unexpected error. Unknown URLs return {"message":"Route not found"}. Health returns status and current ISO time. Startup connects before listening on all IPv4 interfaces.

From server/:

```powershell
npm.cmd install
# Set your real MONGO_URI in server/.env privately before these two commands:
npm.cmd run seed
npm.cmd run dev
npm.cmd test
npm.cmd run test:integration
node tests/dev-startup.test.js
```

The missing .env was recreated with PORT=5000 and an empty MONGO_URI; no credentials were invented or overwritten. The example uses a local MongoDB URI. The seed inserts only missing A1 menu items and preserves existing menu records and all other collections. Repeating the seed is safe.

Verification: 48 HTTP/Postman assertions passed in offline mode and against actual isolated MongoDB. All seven main requests passed: GET all/category/search/by-ID, POST, PUT, DELETE. Failures tested include missing name (400), negative price (400), malformed ID (400), valid missing ID (404), update validation, invalid types/category/protected fields, malformed JSON, and simulated database failures (500). The integration test confirms all 20 A1 menu records remain unchanged and runs the seed twice. Temporary databases are removed afterward; this does not verify Atlas connectivity.

Postman v2.1: A2/restaurant-api.postman_collection.json, folder Question 4 Menu API, baseUrl=http://localhost:5000. GET all captures menuItemId; POST captures createdMenuItemId for PUT/DELETE. Status scripts were executed against real HTTP responses; no response examples were fabricated. Avoid repeated POST without DELETE cleanup.

Screenshots: A2/screenshots/q4-menu-success.png exists and was inspected (GET, URL, 200, menu JSON). A2/screenshots/q4-menu-failure.png is missing. See A2/Q4_SCREENSHOT_INSTRUCTIONS.md for the exact manual request and required visible evidence. Q4 submission is not complete until that real screenshot is captured and your database URI is configured.

Startup verification: npm run dev started only node server.js, logged MongoDB connected and Server running at http://localhost:5054, and returned health HTTP 200 using an isolated database and temporary port. Normal configured port remains 5000. Without a real MONGO_URI, normal startup correctly exits 1 with a configuration message. npm install completed; repository lint, explicit backend lint, scoped backend typecheck, and JavaScript syntax checks passed.
