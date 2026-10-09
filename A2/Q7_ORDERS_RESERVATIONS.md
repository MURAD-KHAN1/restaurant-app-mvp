# Assignment 2 ? Question 7: Orders and Reservations

Implementation uses the existing Express/Mongoose server, JWT middleware, React Navigation, design, and single API client in src/api/client.js. Q1?Q6 functionality and documents are preserved. No new dependency was required.

## Run

1. Keep server/.env private and configured with the existing MongoDB URI and JWT secret.
2. From the project root: npm.cmd run seed --prefix server. This inserts missing original tables/menu/accounts without clearing orders, reservations or existing edits.
3. Terminal 1: npm.cmd run dev --prefix server.
4. Terminal 2: npx.cmd expo start. For laptop browser verification use npm.cmd run web.
5. Use the same Wi-Fi for both devices. BASE_URL remains in src/api/client.js; update its LAN address if the laptop IP changes. Phone localhost refers to the phone.
6. Customer: customer@example.com / Password123. Manager: manager@example.com / Manager123. These are seeded demo accounts; signup only creates customers.

## Models and database safety

- Order: original Q3 fields retained, including user, item menu references/quantity/note/name/unitPrice, totals, orderType, table/pickupTime, promoCode, status and timestamps. Added customerName/customerEmail snapshots for the existing UI. Prices and item names are copied from MongoDB at checkout and remain stable after menu edits.
- Reservation: original Q3 user/table/date/time/partySize/phone/status and timestamps retained. Added customerName/customerEmail. A unique compound index on table/date/time applies only to Pending or Accepted records, protecting concurrent requests and freeing declined/cancelled slots.
- Table: original Q3 schema retained unchanged: unique positive integer tableNumber, seats, name, area, available and timestamps. Seed preserves the six A1 table capacities and labels; the API returns MongoDB IDs for selections.
- Server startup waits for the reservation index before accepting requests. Seed never drops collections. Existing local demo orders/reservations are discarded from old AsyncStorage keys, not imported as genuine server records.

## Authenticated endpoints

| Method/path | Access | Result |
| --- | --- | --- |
| POST /api/orders | Customer | 201 saved order |
| GET /api/orders/my | Customer | 200 JWT owner's orders, newest first |
| GET /api/orders | Manager | 200 all orders |
| PATCH /api/orders/:id/status | Manager | 200 validated next status |
| POST /api/reservations | Customer | 201 saved booking |
| GET /api/reservations/my | Customer | 200 JWT owner's bookings, newest first |
| GET /api/reservations | Manager | 200 all bookings |
| PATCH /api/reservations/:id | Manager accepts/declines; owner may cancel | 200 validated status |
| GET /api/tables | Authenticated | 200 available tables with server IDs |
| GET /api/tables?date=YYYY-MM-DD&time=19:00&partySize=2 | Authenticated | 200 tables with enough seats and no active conflict |

Missing/invalid/expired JWT: 401. Wrong role: 403. Malformed input/illegal transitions: 400. Valid but missing document ID: 404. Duplicate active reservation slot: 409. Error responses are JSON with a message; database errors/secrets are not exposed.

## Order example and pricing

POST /api/orders body (replace placeholders with IDs returned by GET /api/menu and /api/tables):

~~~json
{
  "items": [{ "menuItem": "MENU_OBJECT_ID", "quantity": 2, "note": "No chilli" }],
  "orderType": "Takeaway",
  "pickupTime": "15 minutes",
  "promoCode": "WELCOME10"
}
~~~

For Dine-in, send table: TABLE_OBJECT_ID instead of pickupTime. Checkout never sends calculated prices/totals. Server validates ID, quantity (integer 1?99), note, item existence/availability, fulfillment and promo. Unknown client fields cannot override ownership/status. The API tolerates but ignores client price/total values for the anti-tampering demonstration.

Server rounds in integer cents: subtotal from database price ? quantity, service charge 5%, sales tax 15%, WELCOME10 discount 10% or FEAST20 discount 20%. Total is subtotal + service + tax ? discount. Verified fixture: database price 129.99 ? 2 gives subtotal 259.98, charge 13.00, tax 39.00 and total 311.98, despite client price/total 1. WELCOME10 makes discount 26.00 and total 285.98.

Only Pending ? Preparing ? Ready ? Served is allowed. Pending ? Cancelled is allowed; Preparing/Ready cannot be cancelled. Served/Cancelled are terminal. Atomic updates compare previous status to prevent concurrent stale writes.

## Reservation example

~~~json
{
  "table": "TABLE_OBJECT_ID",
  "date": "FUTURE_YYYY-MM-DD",
  "time": "19:00",
  "partySize": 2,
  "phone": "0300-1234567",
  "customerName": "Guest name"
}
~~~

Dates must be real calendar dates. Slots are hourly 12:00?22:00 in Pakistan time (UTC+05:00), at least one hour ahead. Party size is an integer 1?12 and must fit the selected available table. Active Pending/Accepted bookings conflict on the same table/date/time, regardless of customer. Inactive Declined/Cancelled records do not occupy the slot. Guest name is optional; ownership and customer email always come from JWT. Manager accepts/declines Pending records; customers can cancel only their own Pending/Accepted records.

## Frontend behavior

- OrdersContext and RestaurantContext load authenticated server lists. Data is keyed by endpoint/token so another session's records cannot leak during login changes. No local order/reservation save, restore or fake progression remains.
- Order summary awaits POST success, displays the authoritative total, clears the cart on success and preserves it on failure. Submission guard prevents duplicate taps while pending.
- OrdersScreen fetches immediately when focused, uses setInterval(..., 10000), and clears the interval on blur/unmount. The timer only refreshes server state and elapsed-time display. Pull-to-refresh, loading/error and retry remain available.
- Reservation form uses server table IDs and selected-slot availability across all customers, awaits POST, surfaces server errors, refreshes saved bookings and preserves owner cancellation.
- Manager order and reservation buttons await PATCH and refetch the server lists. Cancel Pending, accept/decline and next-status controls follow server rules. Menu management and the existing design/navigation remain intact.

## Postman

Import restaurant-api.postman_collection.json. Set baseUrl to http://localhost:5000 (collection adds /api). Existing Q4/Q5 folders are preserved. Run Question 7 Orders and Reservations in order: login captures JWTs, menu captures IDs, requests create/update an order, check reverse transition/unavailable item, create/conflict/read/accept/decline/cancel reservations, and check protected access. All variables start empty; no real tokens/secrets are saved. The demonstration assumes an available dish, an unavailable dish, and free future slots. If existing demo bookings occupy the selected slots, choose different future slots. Running this folder creates actual demo records.

## Automated verification

Run from project root:

~~~powershell
npm.cmd run test:integration --prefix server
npm.cmd run test:q5 --prefix server
npm.cmd run test:q7 --prefix server
npm.cmd run test:q6
npm.cmd run lint
~~~

Optional browser checks require a separate temporary Playwright installation and Chrome, plus running backend/Expo web. Use Q7_PLAYWRIGHT_PATH to point to its module if it is not at the temporary mad-q6-browser installation. Then run npm.cmd run test:q7:web. The test removes only its own created order/reservation in finally; existing records are preserved.

| Verification | Result |
| --- | --- |
| Q4 menu HTTP/Postman and real disposable MongoDB | 48 checks passed |
| Q5 authentication/JWT/protected routes | 58 checks passed |
| Q6 client/session/menu integration | 23 checks passed |
| Q7 orders/reservations API/business rules and executable Postman scripts | 115 checks passed |
| Q7 two independent browser sessions | 19 checks passed (real server; independent browser contexts) |
| Q6 existing web UI regression | 18 checks passed |
| Lint, typecheck, Expo web/Android export | Passed; both platforms bundled successfully |

Total: **281 automated checks passed** (48 + 58 + 23 + 115 + 19 + 18). Browser fixtures were removed after verification. Backend and Expo web were running on ports 5000 and 8081 at the end of verification. All app sources passed no-emit JavaScript/import checks; shared API and Q7 server files additionally passed checkJs typechecking.

Q7 covers server-priced totals, unavailable/missing items, ID/quantity/body validation, customer ownership, manager access, each valid/invalid status transition, cancellation, capacity, dates/time/phone, duplicate 409, concurrent 201/409, freed inactive slots and all table availability across customers. Q4/Q5/Q7 API checks use actual temporary MongoDB instances and real HTTP; they do not reset the configured database.

## Submission evidence status

Two browser contexts validate shared server state, but physical two-device testing has not been performed here. No Q7 screen recording or real share URL has been provided. Follow Q7_VIDEO_INSTRUCTIONS.md, record one video of at most four minutes, upload it, and replace the explicit README placeholder. The existing original app demo link is preserved and is not represented as Q7 evidence. Q7 implementation is ready; the recording submission is pending.

## Q7 file inventory

Created: server/controllers/orderController.js, server/controllers/reservationController.js, server/routes/orderRoutes.js, server/routes/reservationRoutes.js, server/routes/tableRoutes.js, server/utils/validation.js, server/tests/orders-reservations.test.js, src/api/orders.js, src/api/reservations.js, tests/q7-web.test.js, A2/Q7_ORDERS_RESERVATIONS.md, A2/Q7_VIDEO_INSTRUCTIONS.md.

Modified: server/models/Order.js, server/models/Reservation.js, server/middleware/auth.js, server/server.js, server/seed.js, server/package.json, src/context/OrdersContext.js, src/context/RestaurantContext.js, src/hooks/useApi.js, src/hooks/useReservation.js, src/reducers/ordersReducer.js, src/screens/OrderSummaryScreen.js, src/screens/OrdersScreen.js, src/screens/ReservationScreen.js, src/screens/ManagerDashboardScreen.js, src/screens/ProfileScreen.js, package.json, README.md, A2/restaurant-api.postman_collection.json. The original Table model was restored without schema changes. Other existing workspace changes predate this Q7 work.
