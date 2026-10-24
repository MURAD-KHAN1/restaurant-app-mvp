const { menu } = require("./data");

const markUnavailable = (menuList, id) =>
  menuList.map((item) => (item._id === id ? { ...item, available: false } : item));

const updatedMenu = markUnavailable(menu, "m1");
console.log("Original menu:", menu);
console.log("Updated menu (m1 unavailable):", updatedMenu);
