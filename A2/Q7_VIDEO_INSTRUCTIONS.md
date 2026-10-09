# Q7 video instructions ? one recording, maximum 4 minutes

## Before recording

1. Keep server/.env configured and private. From the project root run npm.cmd run seed --prefix server once; it preserves existing data.
2. Start backend: npm.cmd run dev --prefix server. Start app separately: npx.cmd expo start.
3. Use two devices on the laptop's Wi-Fi, both connected to the same backend in src/api/client.js. Confirm both can open http://LAPTOP_LAN_IP:5000/api/health. If the IP changes, update the one BASE_URL and reload both apps.
4. Device A: customer@example.com / Password123. Device B: manager@example.com / Manager123. Use the existing app supported on each device; confirm the Expo development client matches the installed SDK before the recording.
5. Choose an available menu item and a free future reservation slot, at least one hour ahead, with a table that fits your party. Use phone 0300-1234567. Do a practice run first; avoid reusing occupied table/date/time slots.
6. Plan one continuous recording that clearly shows both devices. A camera filming both screens side by side is suitable; alternatively capture both device screens together on a laptop. Do not show environment files, database credentials, real JWTs or password hashes.

## Numbered recording sequence (target 3 minutes 30 seconds)

1. 0:00?0:20 ? Show both running apps and identify customer A and manager B. Say both use the same server and MongoDB.
2. 0:20?1:00 ? On A, add an available dish, open Cart, review order, choose Takeaway/pickup or a valid Dine-in table, then Confirm order. Show the success message and Pending order ID/total. Mention the backend calculates database prices and totals.
3. 1:00?1:45 ? On A, open Reserve. Enter name, formatted phone, future date, two guests and a free table/time. Request reservation, review the confirmation and Confirm. Show Pending in My Reservations.
4. 1:45?2:15 ? On B, open Reservations and refresh. Identify A's booking by guest/date/time/table. Press Accept and show Accepted.
5. 2:15?2:35 ? On A, refresh reservations and show Accepted. This confirms shared database state across devices.
6. 2:35?3:10 ? On A, open Orders and leave it visible. On B, open Orders and refresh, identify the same order ID, press Mark Preparing, then Mark Ready. Show each server-confirmed manager change.
7. 3:10?3:30 ? Keep A's Orders screen visible without restarting or pressing refresh. Wait at most one normal 10-second poll; show its Ready badge on that order. Say the interval fetches server state every ten seconds and is cleared when the screen is left. End recording before 4:00.

Optional extra accept/decline, capacity/conflict and invalid-transition demonstrations are already covered by automated tests/Postman; include them only if the recording stays within four minutes. Do not claim automated browser sessions were physical devices.

## Save and submit

1. Save the recording as A2/Q7_orders_reservations_demo.mp4 if storing a local copy. Check actual duration is at most 4:00 and both device screens/statuses are readable.
2. Upload the final file to Google Drive, YouTube (unlisted) or another shareable service. Set link permissions so the examiner can view it.
3. Open the share URL while signed out to verify access. Use the real uploaded video's URL, never a fabricated placeholder or the old A1 demo link.
4. In README.md replace Q7 Demo Video: **[ADD REAL VIDEO LINK AFTER RECORDING]** with a Markdown link to that video. Keep the existing original app demo link.
5. Update the evidence status in Q7_ORDERS_RESERVATIONS.md only after the physical two-device flow, recording, duration and real README link are verified.

Current status: physical two-device flow not performed here; Q7 recording and real video URL pending. The app/server implementation and automated tests can be completed without inventing submission evidence.
