// Task 5: Array methods (map, filter, find, some, chaining, forEach)
const { menu } = require("./data");

// 1. All dish names (map)
console.log("All dish names:", menu.map((item) => item.name));

// 2. Only available dishes (filter)
console.log("Available dishes:", menu.filter((item) => item.available));

// 3. Dish with id "m5" (find) and try "m99"
console.log("Dish m5:", menu.find((item) => item._id === "m5"));
console.log("Dish m99:", menu.find((item) => item._id === "m99"));

// 4. Any dish > Rs. 2000 (some)
console.log("Any dish > Rs. 2000:", menu.some((item) => item.price > 2000));

// 5. Names of available Mains (chain filter and map)
console.log("Available Mains names:", menu.filter((item) => item.available && item.category === "Mains").map((item) => item.name));

// 6. Print each dish as "Name: Rs. price" (forEach)
menu.forEach((item) => console.log(`${item.name}: Rs. ${item.price}`));

