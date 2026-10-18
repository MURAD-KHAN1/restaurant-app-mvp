// Task 8: Loose vs strict equality, truthy/falsy, and isCartEmpty
const { cart } = require("./data");

// Predictions:
// 0 == "0"          -> true
// 0 === "0"         -> false
// null == undefined -> true
// null === undefined-> false
// "" == 0           -> true
// Boolean([])       -> true
// Boolean("")       -> false
// Boolean("0")      -> true
// Boolean(NaN)      -> false

// eslint-disable-next-line eqeqeq
console.log('0 == "0":', 0 == "0");
console.log('0 === "0":', 0 === "0");
// eslint-disable-next-line eqeqeq
console.log("null == undefined:", null == undefined);
console.log("null === undefined:", null === undefined);
// eslint-disable-next-line eqeqeq
console.log('"" == 0:', "" == 0);
console.log("Boolean([]):", Boolean([]));
console.log('Boolean(""):', Boolean(""));
console.log('Boolean("0"):', Boolean("0"));
console.log("Boolean(NaN):", Boolean(NaN));

const isCartEmpty = (cartArr) => Array.isArray(cartArr) && cartArr.length === 0;

console.log("isCartEmpty([]):", isCartEmpty([]));
console.log("isCartEmpty(cart):", isCartEmpty(cart));

