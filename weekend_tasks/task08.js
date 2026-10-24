const { cart } = require("./data");

console.log('0 == "0":', 0 == "0");
console.log('0 === "0":', 0 === "0");
console.log("null == undefined:", null == undefined);
console.log("null === undefined:", null === undefined);
console.log('"" == 0:', "" == 0);
console.log("Boolean([]):", Boolean([]));
console.log('Boolean(""):', Boolean(""));
console.log('Boolean("0"):', Boolean("0"));
console.log("Boolean(NaN):", Boolean(NaN));

const isCartEmpty = (cartArr) => Array.isArray(cartArr) && cartArr.length === 0;

console.log("isCartEmpty([]):", isCartEmpty([]));
console.log("isCartEmpty(cart):", isCartEmpty(cart));
