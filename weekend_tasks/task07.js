// Task 7: Template literals, ternary, optional chaining (?.), and nullish coalescing (?? vs ||)
const { menu, user } = require("./data");

// 1. Build URL from BASE_URL and id using template literal
const BASE_URL = "http://192.168.1.15:5000/api";
const id = "m3";
const endpointUrl = `${BASE_URL}/menu/${id}`;
console.log("Built URL:", endpointUrl);

// 2. Print "Add to cart" or "Unavailable" for every dish using ternary
menu.forEach((dish) => {
  console.log(`${dish.name}: ${dish.available ? "Add to cart" : "Unavailable"}`);
});

// 3. Optional chaining on user.address?.city, then catch error without ?.
console.log("With optional chaining (user.address?.city):", user.address?.city);
try {
  console.log(user.address.city);
} catch (err) {
  console.log("Error without ?. :", `${err.name}: ${err.message}`);
}

// 4. Predict and check output for ?? vs ||
// Predictions:
// line.qty ?? 1  -> 0 (because 0 is neither null nor undefined)
// line.qty || 1  -> 1 (because 0 is falsy, so || falls back to 1)
// line.note ?? "none" -> "none" (because line.note is undefined)
// line.note || "none" -> "none" (because undefined is falsy)
const line = { qty: 0 };
console.log("line.qty ?? 1:", line.qty ?? 1);
console.log("line.qty || 1:", line.qty || 1);
console.log("line.note ?? 'none':", line.note ?? "none");
console.log("line.note || 'none':", line.note || "none");

