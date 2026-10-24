const { menu } = require("./data");

console.log("All dish names:", menu.map((item) => item.name));

console.log("Available dishes:", menu.filter((item) => item.available));

console.log("Dish m5:", menu.find((item) => item._id === "m5"));
console.log("Dish m99:", menu.find((item) => item._id === "m99"));

console.log("Any dish > Rs. 2000:", menu.some((item) => item.price > 2000));

console.log("Available Mains names:", menu.filter((item) => item.available && item.category === "Mains").map((item) => item.name));

menu.forEach((item) => console.log(`${item.name}: Rs. ${item.price}`));
