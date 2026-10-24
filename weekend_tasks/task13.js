const { menu } = require("./data");

function getMenu(shouldFail) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error("Server not reachable"));
      } else {
        resolve(menu);
      }
    }, 1000);
  });
}

async function loadMenu(shouldFail) {
  try {
    const items = await getMenu(shouldFail);
    console.log("Dish count:", items.length);
  } catch (err) {
    console.log("Error:", err.message);
  } finally {
    console.log("Hide spinner");
  }
}

async function run() {
  await loadMenu(false);
  await loadMenu(true);
}

run();
