const orderObj = {
  tableNo: 4,
  items: [{ menuItem: "m1", qty: 2 }],
  note: undefined,
  print: () => "hello",
  createdAt: new Date("2026-10-14T09:00:00Z")
};

const jsonString = JSON.stringify(orderObj);
console.log("JSON.stringify output:", jsonString);

const back = JSON.parse(jsonString);
console.log("Parsed object (back):", back);
console.log("typeof back.createdAt:", typeof back.createdAt);
console.log("back.items[0].qty:", back.items[0].qty);

try {
  JSON.parse("{name: 'Raita'}");
} catch (err) {
  console.log("Invalid JSON error:", err.message);
}

const validParsed = JSON.parse('{"name": "Raita"}');
console.log("Valid JSON.parse output:", validParsed);
