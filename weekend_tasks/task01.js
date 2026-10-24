function addTax(amount) {
  return amount * 1.16;
}

const addTax2 = (amount) => amount * 1.16;

const lineTotal = (price, qty) => {
  return price * qty;
};

const formatPrice = (p, cur = "Rs.") => `${cur} ${p}`;

console.log("addTax(1000):", addTax(1000));
console.log("addTax2(1000):", addTax2(1000));
console.log("lineTotal(1450, 2):", lineTotal(1450, 2));
console.log("formatPrice(1450):", formatPrice(1450));
console.log("formatPrice(1450, 'PKR'):", formatPrice(1450, "PKR"));
