# Assignment 2 - Question 4: Menu API

Implemented only Q4. No JWT, auth middleware, or Q5-Q7 features were added. A1, seed data, models, and .env were preserved.

## Files

Created server/controllers/menuController.js, server/routes/menuRoutes.js, server/tests/menu-api.test.js, A2/restaurant-api.postman_collection.json, and this handoff.
Modified server/server.js to mount the menu routes before the 404 handler and return 400 for malformed JSON bodies.

## Start

```powershell
cd C:\Users\LENOVO\Desktop\MAD\restaurant-app-mvp\server
npm run dev
```

Base URL: http://localhost:5000

| Method | Path | Successful response |
| --- | --- | --- |
| GET | /api/menu | 200, array of menu items |
| GET | /api/menu/:id | 200, one item |
| POST | /api/menu | 201, created item |
| PUT | /api/menu/:id | 200, updated item |
| DELETE | /api/menu/:id | 200, confirmation message |

GET all accepts category and search together or separately. Category is an exact category match; name search is a case-insensitive literal substring. Search regex characters are escaped. Repeated query parameters, operator-shaped parameters, protected body fields, and wrong scalar types return 400. PUT accepts partial updates and runs Mongoose validators. Each controller has try/catch; unexpected database failures return a generic 500 JSON response.

## Verification

Run from the project root:

```powershell
node server/tests/menu-api.test.js
```

This connects to Atlas, uses an ephemeral local HTTP port, and creates/updates/deletes one temporary item. It does not reseed or replace existing menu items. The final run passed 42 checks and confirmed all 20 seeded items were unchanged. Coverage includes all five endpoints, category/search/combined filters, case variants, escaped regex, operator-input rejection, malformed JSON, required/type/enum/minimum validation, update validation, protected fields, invalid IDs, nonexistent IDs, health/404 routes, and simulated database failures for every controller.

Required failures passed via automated HTTP requests (not manual Postman interaction): missing name -> 400; negative price -> 400; invalid ID -> 400; valid nonexistent ID -> 404. The server continued responding after errors. Repository lint and JavaScript checkJs type checking for the API implementation passed.

## Postman

A2/restaurant-api.postman_collection.json is a programmatically prepared, importable Postman v2.1 collection, not an export from manual Postman use or fabricated test evidence.

1. Import the JSON file in Postman.
2. Keep baseUrl set to http://localhost:5000.
3. Run GET all first; its test script stores menuItemId for GET one.
4. Run POST before PUT/DELETE; POST stores createdMenuItemId. DELETE removes only that newly created demo item. Avoid rerunning POST without deleting its item.
5. Run the three required failure requests manually: POST missing name, POST negative price, and GET wrong ID. Also run GET nonexistent item.
6. If the assignment requires an export specifically produced by Postman, use the imported collection's menu > Export > Collection v2.1 and save as A2/restaurant-api.postman_collection.json.

## Screenshots still required

Successful: GET http://localhost:5000/api/menu. Show URL, 200 OK, and menu JSON. Save as A2/screenshots/q4-menu-success.png.

Failed: POST http://localhost:5000/api/menu, Body > raw > JSON:

```json
{
  "name": "Invalid Dish",
  "category": "Mains",
  "price": -100
}
```

Show URL, JSON request body, 400 Bad Request, and JSON validation response. Save as A2/screenshots/q4-menu-failure.png.

No screenshots were fabricated. Manual Postman execution and the two real screenshots remain to be done by the user.
