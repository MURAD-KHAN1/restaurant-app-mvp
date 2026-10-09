# Q4 real screenshots

The existing q4-menu-success.png shows a real GET /api/menu, HTTP 200, and JSON menu response. It was preserved. The failure screenshot is still missing; no screenshot was fabricated.

First configure your private MONGO_URI in server/.env, then run npm.cmd run seed and npm.cmd run dev from server/. Import A2/restaurant-api.postman_collection.json into Postman.

Success (retake only if needed): send GET http://localhost:5000/api/menu. Show GET, the full URL, 200 OK, and the JSON array. Save as A2/screenshots/q4-menu-success.png.

Failure: send POST http://localhost:5000/api/menu with Body > raw > JSON and Content-Type: application/json:

```json
{"name":"Invalid Dish","category":"Mains","price":-100}
```

Show POST, the full URL, JSON request body, 400 Bad Request, and JSON error response. Save as A2/screenshots/q4-menu-failure.png. This is collection request 09 FAIL Negative Price. The current validation response is {"message":"Validation failed"}.

Postman/VS Code UI cannot be operated through the available tools, so capture this real request manually.
