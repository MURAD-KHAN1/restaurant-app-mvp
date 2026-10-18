// Task 9: CommonJS require with destructuring from utils.js
const { addTax, formatPrice } = require("./utils");

const amountWithTax = addTax(1000);
console.log("Formatted price with tax:", formatPrice(amountWithTax));
console.log("Formatted price in PKR:", formatPrice(amountWithTax, "PKR"));

