const menu = [
  { _id: "m1", name: "Chicken Karahi", price: 1450, category: "Mains", available: true },
  { _id: "m2", name: "Daal Makhni", price: 650, category: "Mains", available: false },
  { _id: "m3", name: "Raita", price: 150, category: "Sides", available: true },
  { _id: "m4", name: "Naan", price: 60, category: "Sides", available: true },
  { _id: "m5", name: "Mutton Pulao", price: 2200, category: "Mains", available: true },
  { _id: "m6", name: "Kheer", price: 300, category: "Desserts", available: false }
];

const cart = [
  { menuItem: "m1", price: 1450, qty: 2 },
  { menuItem: "m3", price: 150,  qty: 3 },
  { menuItem: "m4", price: 60,   qty: 4 }
];

const user = { _id: "u7", name: "Ali", email: "ali@test.com", password: "$2a$10$hashed...", role: "customer", address: null };

module.exports = { menu, cart, user };

