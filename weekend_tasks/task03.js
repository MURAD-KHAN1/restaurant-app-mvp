// Task 3: Destructuring, Spread, and Rest
const { menu, user } = require("./data");

// 1. Destructure name and price from menu[0] and print
const { name, price } = menu[0];
console.log("Destructured menu[0]:", name, price);

// 2. Destructure id, category, email, and password in 3 lines
const req = { params: { id: "m5" }, query: { category: "Mains" }, body: { email: "a@b.com", password: "123" } };
const { id } = req.params;
const { category } = req.query;
const { email, password } = req.body;
console.log("Destructured req:", { id, category, email, password });

// 3. Create updated copy of menu[0] with price 1600 and print both
const updated = { ...menu[0], price: 1600 };
console.log("Original menu[0]:", menu[0]);
console.log("Updated copy:", updated);

// 4. Use rest to create safeUser from user without password and print
const { password: removedPassword, ...safeUser } = user;
console.log("safeUser (without password):", safeUser);

