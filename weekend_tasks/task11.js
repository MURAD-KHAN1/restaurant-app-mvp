// Task 11: Event loop and timer execution order
// Predicted order: A, D, F, C, E, B
console.log("A");
setTimeout(() => console.log("B"), 1000);
setTimeout(() => console.log("C"), 0);
console.log("D");
setTimeout(() => console.log("E"), 500);
console.log("F");

