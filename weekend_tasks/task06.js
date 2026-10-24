const { cart } = require("./data");
const { addTax } = require("./utils");

const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
const finalAmount = addTax(subtotal);

console.log("Cart Subtotal:", subtotal);
console.log("Final Amount (with 16% tax):", finalAmount);
