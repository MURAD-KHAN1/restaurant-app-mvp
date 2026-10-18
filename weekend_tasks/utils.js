function addTax(amount) {
  return amount * 1.16;
}

const formatPrice = (p, cur = "Rs.") => `${cur} ${p}`;

module.exports = { addTax, formatPrice };

