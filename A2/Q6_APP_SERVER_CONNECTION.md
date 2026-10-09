# Assignment 2 Question 6: App/server connection

Objective: connect existing authentication/menu screens to the Q4/Q5 backend while preserving A1 design, navigation, local orders, and local reservations. Q7 was not added; backend source and Q4/Q5 documents were not changed.

Created: src/api/client.js, src/api/session.js, src/api/menu.js, src/hooks/useApi.js, src/constants/menu.js, src/types/assets.d.ts, tests/q6-helper.test.js, tests/q6-web.test.js, this document, Q6_SCREENSHOT_INSTRUCTIONS.md, and two supplemental web verification PNGs.

Modified: root package.json (restored damaged Expo metadata from the existing lockfile), README.md, src/context/AuthContext.js, RestaurantContext.js, src/navigation/AppNavigator.js, src/screens/LoginScreen.js, MenuScreen.js, ManagerDashboardScreen.js, ProfileScreen.js. Removed unreferenced src/data/menu.js and src/data/users.js. Their asset/category metadata moved to constants/menu.js; complete mock dishes were not copied.

One BASE_URL: src/api/client.js. Detected active Wi-Fi address: 192.168.18.124. Default API URL: http://192.168.18.124:5000/api. Both web and physical phone use this server. Edit this one file when the IP changes, or override EXPO_PUBLIC_API_URL before starting Expo (Android emulator can use http://10.0.2.2:5000/api). Express already listens on 0.0.0.0; no firewall or Atlas access rules were altered.

apiRequest sends JSON, adds a Bearer header when given a token, handles empty bodies, parses JSON safely, preserves server error messages/status, and provides network/timeout errors without logging tokens. AuthContext calls login/register and stores both token and sanitized user through AsyncStorage. Startup restores both before showing navigation. Logout removes both keys before clearing context. IDs normalize from _id to id. Public signup sends only name/email/password; the obsolete manager role selector was removed. Back Welcome was preserved; demo passwords are documented only in README/testing docs.

useApi is used directly in MenuScreen and ManagerDashboardScreen. It returns data/loading/error/refetch, uses async/await, aborts superseded/unmounted requests, and updates the shared in-memory menu after successful GET /menu. Existing search/category/sorting/favourites remain local filtering of server results. _id/available normalize to id/isAvailable; optional fields have safe defaults and original image assets are resolved by path with icon fallback.

MongoDB is the menu source of truth. RestaurantContext no longer reads/writes menu or performs local manager edits; stale menu storage is removed. Its reservations and the OrdersContext remain local. Manager add/price/availability/delete use POST/PUT/DELETE with the current manager token, then refetch. Busy controls prevent duplicate actions; 401/403 receive useful messages. Customer Menu retains initial loading, error, Retry, pull-to-refresh, and a web-accessible refresh icon.

Run backend from server/: npm.cmd run dev. Run app from root: npx.cmd expo start (Expo Go), or npm.cmd run web. Existing demo accounts: customer@example.com / Password123 and manager@example.com / Manager123. Both clients must share Wi-Fi and the same BASE_URL.

Validation: npm.cmd run test:q6 checks API headers/parsing/errors, session save/restore/clear/rollback, normalization, signup/logins, and menu mutations against disposable MongoDB. The optional q6-web.test.js uses a temporary Playwright installation and installed Chrome to exercise actual UI flows against the configured live server; it deletes only its created test dish/account. npm.cmd --prefix server test covers Q4/Q5; test:integration reruns Q4 against actual temporary MongoDB. Frontend lint, scoped helper/hook typecheck, Expo dependency compatibility, and Expo web export were checked. Native physical interaction cannot be claimed from web automation.

Two-device steps: manager laptop/web changes Crispy Dynamite Prawns to 1375; customer phone pulls to refresh; both capture dish name and Rs. 1,375. See Q6_SCREENSHOT_INSTRUCTIONS.md. Required q6-manager-new-price.png and q6-customer-new-price.png are missing. Supplemental q6-web-manager-verification.png and q6-web-customer-verification.png are real browser captures, clearly named as web evidence. Submission remains incomplete until the physical demonstration and both required captures are done.

Final results: 23 Q6 helper/integration checks and 18 actual browser checks passed. Q4 passed 48 checks in both offline and real temporary-MongoDB modes; Q5 passed 58 checks. Live backend connected on 0.0.0.0:5000; Metro/web started on 8081 and Login/Menu/Dashboard rendered without runtime module errors. Expo dependency check reported up to date; frontend lint, scoped API/session/menu/useApi typechecking (including image declarations), and web export passed. Session restart/clear, signup/duplicate feedback, initial loading/error/Retry, independent browser refresh, and server-authoritative manager mutations were exercised. Native pull gesture and physical phone launch remain manual.

Android export also passed (975 modules, Hermes bundle); this verifies native bundling, not physical phone execution.

| Matrix | Result |
| --- | --- |
| A/B server + MongoDB | Running and connected on port 5000 |
| C app launches | Actual web launch passed; Android bundle passed; phone launch manual |
| D/E/F logins + signup | Actual UI/backend passed, including duplicate signup |
| G/H session restore + logout | Actual browser reload/AsyncStorage passed |
| I/J/K/L menu + loading/error/Retry | Actual browser API/UI passed |
| M pull refresh | Wired to tested server refetch; physical gesture manual |
| N/O useApi | Present and used by MenuScreen + ManagerDashboardScreen |
| P/Q/R manager add/price/availability | Actual UI POST/PUT/refetch passed; DELETE covered too |
| S restart persistence | Server price survived manager browser restart |
| T/U/V mocks + menu storage | Mock files removed, no imports, menu storage removed |
| W/X Q4/Q5 | 48/58 passed; Q4 also passed real MongoDB regression |
| Y Q7 untouched | Orders/reservations remain local |
