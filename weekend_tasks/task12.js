// Task 12: Promise creation and consumption with .then, .catch, .finally
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

// Call once with false (resolves) and once with true (rejects)
getMenu(false)
  .then((items) => {
    console.log("Dish count:", items.length);
  })
  .catch((err) => {
    console.log("Error:", err.message);
  })
  .finally(() => {
    console.log("Hide spinner");
  });

getMenu(true)
  .then((items) => {
    console.log("Dish count:", items.length);
  })
  .catch((err) => {
    console.log("Error:", err.message);
  })
  .finally(() => {
    console.log("Hide spinner");
  });

