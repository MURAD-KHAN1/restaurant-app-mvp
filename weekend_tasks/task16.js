let count = 0;

const intervalId = setInterval(() => {
  count += 1;
  console.log(`Checking order status... (${count})`);
  if (count === 4) {
    clearInterval(intervalId);
    console.log("Order Ready");
  }
}, 2000);
