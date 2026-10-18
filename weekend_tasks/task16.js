// Task 16: Polling with setInterval and stopping with clearInterval
let count = 0;

const intervalId = setInterval(() => {
  count += 1;
  console.log(`Checking order status... (${count})`);
  if (count === 4) {
    clearInterval(intervalId);
    console.log("Order Ready");
  }
}, 2000);

