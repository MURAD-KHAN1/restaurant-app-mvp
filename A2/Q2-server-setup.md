# Assignment 2 — Question 2: Express Server Setup

Only the Express foundation is implemented. No MongoDB connection, Mongoose, auth, menu, order or reservation API is added. The frontend, A1 documents and Question 1 deliverables remain unchanged.

## Run

From PowerShell:

```powershell
cd C:\Users\LENOVO\Desktop\MAD\restaurant-app-mvp\server
npm.cmd run dev
```

`npm run dev` is the same command when the PowerShell npm wrapper is permitted. `npm.cmd` avoids wrapper execution-policy problems. Stop with Ctrl+C. To run without nodemon, use `npm.cmd start` instead. Run only one server on port 5000 at a time. Dependencies are already installed; no installation is needed.

The server loads server/.env, uses PORT or fallback 5000, and listens on all IPv4 interfaces for local phone testing. MONGO_URI is intentionally empty and unused. Keep .env private; .env.example contains only PORT=5000 and MONGO_URI= and is safe to commit.

## Manual Postman Tests

1. Start the server. In Postman select GET, enter http://localhost:5000/api/health, leave Body empty, and click Send. No authentication is required.
2. Expect 200 OK, Content-Type application/json, and JSON with status equal to ok and time equal to the request's current ISO 8601 UTC timestamp, e.g. {"status":"ok","time":"2026-10-02T17:12:23.240Z"}. This example was observed during local verification; your request will have a new time.
3. Send again and confirm the timestamp changes.
4. GET http://localhost:5000/api/abc must return 404 and exactly {"message":"Route not found"}.
5. Capture a real Postman screenshot of successful health including the full URL, HTTP 200 and response body.

## Physical Phone Browser Test

Connect laptop and phone to the same Wi-Fi. Keep the server running. On the laptop run:

```powershell
ipconfig
```

Find the IPv4 Address under the active Wi-Fi adapter, not loopback, Ethernet virtual adapters, VPNs or disconnected interfaces. At verification time the Wi-Fi address was 192.168.100.9; check again because it can change.

Open this in the phone browser if the address is still current:

```text
http://192.168.100.9:5000/api/health
```

Otherwise substitute the current Wi-Fi IPv4 address. Do not use localhost on the phone. Expect JSON with status ok and a current time. Refresh to request a new timestamp.

Capture a real phone-browser screenshot showing the laptop-IP URL and JSON response. A successful request from the laptop to its LAN IP was verified; a physical phone request and screenshot must still be performed by you.

If the phone cannot connect: verify the server remains running, port/IP are correct, both devices use the same Wi-Fi and the router does not isolate guest clients. If Windows Firewall blocks the connection on a trusted private network, allow the intended Node.js app or an inbound TCP 5000 rule scoped to Private profile/local subnet only. Do not disable the firewall or open public-network access. No firewall settings were changed automatically.

## Error Handling

Valid routes precede the JSON 404 handler; final four-argument (err, req, res, next) middleware returns HTTP 500 with {"message":"Server error"}. It logs errors locally and delegates when headers were already sent. No artificial error endpoint is included. Verification injected a temporary fault into a separate in-memory app instance, confirmed the real 500 response, restored the prototype and closed its listener.

## Deliverables and Verification

Created: server/server.js, server/.env, server/.env.example and A2/Q2-server-setup.md.

Modified: root .gitignore only, to ignore .env and server/.env. server/package.json already provided start=node server.js and dev=nodemon server.js, so it and its dependencies/lockfile were preserved.

Verified: Express, dotenv, CORS, JSON parsing, dynamic health HTTP 200, exact unknown-route 404, unexpected-error 500, both npm start and npm run dev startup, laptop LAN response and environment ignore behavior. No Mongoose is installed or MongoDB connected. Blank config/models/routes/controllers/middleware folders are preserved for later questions.

Manual screenshots outstanding: successful Postman health and successful phone-browser health. No screenshots were fabricated.

Local lint passed for App.js, index.js, src and server/server.js (exit 0); server JavaScript typecheck passed (exit 0). Frontend strict JavaScript typecheck returned exit 2 with 82 diagnostic lines in unchanged A1 files, including existing inferred component props, Animated JSX and icon/image typings; these are not modified for Q2.

A SHA-256 comparison against the Question 2 baseline confirmed .gitignore is the only changed pre-existing file; all 100 other pre-existing files, including A1, frontend, Question 1 artifacts and both server package files, remain byte-identical. The verified test server was stopped to leave port 5000 free for your manual tests.
