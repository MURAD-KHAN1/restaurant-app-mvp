// Task 19: Fake Express req object for PATCH /api/orders/6701c4/status
const req = {
  params: { id: "6701c4" },
  query: {},
  body: { status: "Ready" },
  headers: { authorization: "Bearer abc123" }
};

const { id } = req.params;
const { status } = req.body;

console.log("Order ID (from req.params):", id);
console.log("New Status (from req.body):", status);

