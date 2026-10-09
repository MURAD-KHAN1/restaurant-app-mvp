# Q6 physical phone plus web evidence

The automated checks used two separate browser sessions. This is supplemental web verification, not the required physical two-device demonstration. The two required screenshot files are still missing.

1. Keep backend running on port 5000. On the laptop, run npx.cmd expo start from the project root. Current Wi-Fi IP: 192.168.18.124. If it changes, edit src/api/client.js and restart Expo. Phone and laptop must share Wi-Fi.
2. Laptop web: open http://localhost:8081 and log in with manager@example.com / Manager123. Select Dashboard > Menu.
3. Physical phone: scan Metro's QR in Expo Go and log in with customer@example.com / Password123. Open Menu. Search for Crispy Dynamite Prawns.
4. Manager: find Crispy Dynamite Prawns, enter 1375 in New price, and tap Save. Wait for server refresh. Its price should display Rs. 1,375.
5. Customer: pull down the Menu list to refresh (or tap the refresh icon next to Our menu). The same dish must display Rs. 1,375. This is the required native pull-to-refresh demonstration.
6. Capture manager dish name and Rs. 1,375 on the laptop. Save A2/screenshots/q6-manager-new-price.png. Capture the same dish name and Rs. 1,375 on the phone. Save A2/screenshots/q6-customer-new-price.png. Keep account role/context visible where possible; no tokens or private settings should appear.
7. Restart the app and verify the price still comes from the server. Optionally restore the dish's previous price through the manager UI afterward.

Existing supplemental screenshots: q6-web-manager-verification.png and q6-web-customer-verification.png show an actual temporary test dish at Rs. 777 in independent automated browser sessions. That temporary dish was deleted after testing; these images do not replace the phone evidence.
