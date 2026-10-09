# Q5 real Postman screenshots

None of the three required Q5 screenshots currently exists. No screenshots were generated or fabricated. The available tools cannot operate the Postman UI; follow these steps to capture real results.

1. From server/, run npm.cmd run seed, then npm.cmd run dev. If the server is already running on port 5000, use that instance.
2. In Postman or its VS Code extension, click Import and select A2/restaurant-api.postman_collection.json. Confirm collection baseUrl is http://localhost:5000.
3. Expand Question 5 Auth and Protected Routes. Open 03 Login Customer and click Send. Expect 200; its Tests script saves customerToken automatically.
4. Open 04 Login Manager and click Send. Expect 200; its Tests script saves managerToken automatically. Keep tokens/private settings out of shared captures; show the token variable in the Authorization tab rather than the full secret token value.
5. Open 07 FAIL Add Menu No Token - 401. On Authorization, select No Auth and ensure there is no manually added Authorization header. Click Body > raw > JSON and verify the body below. Click Send. Expect 401 and {"message":"Authentication required"}. Capture POST, the full URL, No Auth, body, status and JSON response. Save A2/screenshots/q5-no-token-401.png.
6. Open 08 FAIL Add Menu Customer Token - 403. Authorization must be Bearer Token with {{customerToken}}. Verify the same JSON body, then Send. Expect 403 and {"message":"Manager access required"}. Capture method, URL, Authorization state, body, status and response. Save A2/screenshots/q5-customer-403.png.
7. Open 09 Add Menu Manager Token - 201. Authorization must be Bearer Token with {{managerToken}}. Verify the same body, then Send. Expect 201 and the created item JSON with an _id. Capture method, URL, Authorization state, body, status and response. Save A2/screenshots/q5-manager-201.png.
8. After saving the manager screenshot, run 11 DELETE Q5 Test Menu to remove only the item created in step 7. Its ID was captured automatically as q5MenuItemId. Expect 200.

All three requests use POST http://localhost:5000/api/menu with Content-Type: application/json:

```json
{
  "name": "Q5 Test Burger",
  "description": "Q5 authentication test item",
  "category": "Mains",
  "price": 700,
  "available": true,
  "isSpecial": false
}
```

Arrange or resize the panes so the request and response are readable in one capture. If the Authorization and Body tabs cannot appear together, leave the body visible and show the enabled Authorization header with Bearer {{customerToken}} or Bearer {{managerToken}} in the Headers pane. Do not substitute a screenshot of these instructions for an actual request.
