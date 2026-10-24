const { menu, user } = require("./data");

const BASE_URL = "http://192.168.1.15:5000/api";
const id = "m3";
const endpointUrl = `${BASE_URL}/menu/${id}`;
console.log("Built URL:", endpointUrl);

menu.forEach((dish) => {
  console.log(`${dish.name}: ${dish.available ? "Add to cart" : "Unavailable"}`);
});

console.log("With optional chaining (user.address?.city):", user.address?.city);
try {
  console.log(user.address.city);
} catch (err) {
  console.log("Error without ?. :", `${err.name}: ${err.message}`);
}

const line = { qty: 0 };
console.log("line.qty ?? 1:", line.qty ?? 1);
console.log("line.qty || 1:", line.qty || 1);
console.log("line.note ?? 'none':", line.note ?? "none");
console.log("line.note || 'none':", line.note || "none");
