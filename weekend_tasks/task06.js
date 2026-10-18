// Task 6: Cart total with reduce and 16% tax
const { cart } = require("./data");
const { addTax } = require("./utils");

/*
 * Step-by-step calculation by hand:
 * Initial accumulator: sum = 0
 * Step 1 (item 1: menuItem "m1", price 1450, qty 2):
 *   line = 1450 * 2 = 2900
 *   new sum = 0 + 2900 = 2900
 * Step 2 (item 2: menuItem "m3", price 150, qty 3):
 *   line = 150 * 3 = 450
 *   new sum = 2900 + 450 = 3350
 * Step 3 (item 3: menuItem "m4", price 60, qty 4):
 *   line = 60 * 4 = 240
 *   new sum = 3350 + 240 = 3590
 * Subtotal = 3590
 * With 16% tax: addTax(3590) = 3590 * 1.16 = 4164.4
 */

const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
const finalAmount = addTax(subtotal);

console.log("Cart Subtotal:", subtotal);
console.log("Final Amount (with 16% tax):", finalAmount);

