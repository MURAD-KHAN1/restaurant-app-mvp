const { menu, user } = require("./data");

const { name, price } = menu[0];
console.log("Destructured menu[0]:", name, price);

const req = { params: { id: "m5" }, query: { category: "Mains" }, body: { email: "a@b.com", password: "123" } };
const { id } = req.params;
const { category } = req.query;
const { email, password } = req.body;
console.log("Destructured req:", { id, category, email, password });

const updated = { ...menu[0], price: 1600 };
console.log("Original menu[0]:", menu[0]);
console.log("Updated copy:", updated);

const { password: removedPassword, ...safeUser } = user;
console.log("safeUser (without password):", safeUser);
