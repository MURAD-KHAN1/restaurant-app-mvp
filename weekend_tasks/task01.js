// Task 1: Function declarations, arrow functions, and default parameters

// 1. Normal function declaration returning amount with 16% tax added
function addTax(amount) {
  return amount * 1.16;
}

// 2. Arrow function with implicit return
const addTax2 = (amount) => amount * 1.16;

// 3. Arrow function with braces and explicit return
const lineTotal = (price, qty) => {
  return price * qty;
};

// 4. Function with default parameter cur = "Rs."
const formatPrice = (p, cur = "Rs.") => `${cur} ${p}`;

console.log("addTax(1000):", addTax(1000));
console.log("addTax2(1000):", addTax2(1000));
console.log("lineTotal(1450, 2):", lineTotal(1450, 2));
console.log("formatPrice(1450):", formatPrice(1450));
console.log("formatPrice(1450, 'PKR'):", formatPrice(1450, "PKR"));

