const { menu, cart } = require("./data");

const fakeMenu = () =>
  new Promise((resolve) => {
    setTimeout(() => resolve(menu), 2000);
  });

const fakeOrders = () =>
  new Promise((resolve) => {
    setTimeout(() => resolve(cart), 3000);
  });

async function runComparison() {
  console.time("Sequential await");
  const menuSeq = await fakeMenu();
  const ordersSeq = await fakeOrders();
  console.timeEnd("Sequential await");
  console.log("Sequential results count:", menuSeq.length, ordersSeq.length);

  console.time("Parallel Promise.all");
  const [menuPar, ordersPar] = await Promise.all([fakeMenu(), fakeOrders()]);
  console.timeEnd("Parallel Promise.all");
  console.log("Parallel results count:", menuPar.length, ordersPar.length);
}

runComparison();
