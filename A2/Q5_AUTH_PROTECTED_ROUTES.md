# Assignment 2 Question 5: Auth and protected routes

Objective: bcrypt password storage, customer registration/login, one-day JWT sessions, and manager-only menu mutations. Frontend integration and Q6/Q7 are untouched; Q4 documentation is preserved.

Created: server/models/User.js, server/controllers/authController.js, server/routes/authRoutes.js, server/middleware/auth.js, server/tests/auth-api.test.js, this document, and A2/Q5_SCREENSHOT_INSTRUCTIONS.md.

Modified: server/server.js, server/routes/menuRoutes.js, server/seed.js, server/package.json, server/.env.example, server/tests/menu-api.test.js, and A2/restaurant-api.postman_collection.json. Existing bcryptjs 3.0.3 and jsonwebtoken 9.0.3 were reused without reinstalling. Private environment values were preserved.

| Auth endpoint | Result |
| --- | --- |
| POST /api/auth/register | 201, {token,user}; public customer only |
| POST /api/auth/login | 200, {token,user} |

Register requires name, valid email, and an 8-character minimum password (maximum 72 UTF-8 bytes). Emails are trimmed/lowercased and uniquely indexed. Explicit public role fields are rejected with 400. Duplicate email is 409, malformed input is 400, wrong credentials are 401, and unexpected faults are generic JSON 500.

| Menu route | Access |
| --- | --- |
| GET /api/menu, GET /api/menu/:id | Public |
| POST /api/menu | Authenticated manager |
| PUT /api/menu/:id | Authenticated manager |
| DELETE /api/menu/:id | Authenticated manager |

Missing/invalid/expired tokens return 401; customer mutations return 403. protect verifies HS256, loads the current database user, and attaches only safe identity fields to req.user. Role changes take effect for existing tokens. JWT contains user ID and standard issue/expiry times and expires in exactly 1 day (86400 seconds).

User document saves hash changed passwords with bcrypt cost 10. Passwords are excluded from default queries and user JSON; register/login explicitly return only ID, name, email and role. Seed inserts missing demo users, migrates their legacy plaintext passwords, and preserves already hashed passwords on repeat runs. It does not clear collections, change existing credentials/roles, or replace existing menu records.

Existing A1 demo testing accounts: customer@example.com / Password123 (customer), manager@example.com / Manager123 (manager). These are the app's existing demo credentials, not private database settings. No hashes or private settings are included here.

From server/:

```powershell
npm.cmd run seed
npm.cmd run dev
npm.cmd test
npm.cmd run test:integration
```

Verification: npm test passed 48 Q4 checks plus 58 Q5 checks (106 total). Q5 uses actual disposable MongoDB and real HTTP requests. All Q4 checks also passed against actual disposable MongoDB with manager authentication. Coverage includes password hashing/omission, legacy migration, repeat seeding, duplicate registration, one-day expiry, privilege escalation prevention, invalid/expired tokens, current database roles, public reads, and manager-only POST/PUT/DELETE. Q5 Postman scripts also ran against actual HTTP responses. The live seed connected successfully, prepared hashed demo users, and inserted no menu records. Temporary test databases are removed afterward.

Postman: A2/restaurant-api.postman_collection.json retains all 19 Q4 requests and adds 13 Q5 requests. baseUrl=http://localhost:5000. Run Q5 requests 03/04 to capture customerToken/managerToken before Q4 mutations. Q5 07/08/09 are the required screenshot cases (401/403/201); request 11 cleans up only its new menu item. Registration uses a fresh demo email per run.

Required screenshots: A2/screenshots/q5-no-token-401.png, q5-customer-403.png, q5-manager-201.png. All three are currently missing. Follow A2/Q5_SCREENSHOT_INSTRUCTIONS.md for exact steps. Q5 submission remains incomplete until all three real screenshots are saved.

Final startup/live verification: npm run dev logged MongoDB connected and Server running at http://localhost:5000. Live health/public menu and both seeded logins returned 200; live menu POST returned 401 without a token, 403 for a customer, and 201 for a manager. The smoke item was deleted and menu count remained unchanged. The dev server was left running for manual screenshots. Explicit backend lint, scoped backend typechecking, JavaScript syntax checks, and Postman JSON validation passed.
