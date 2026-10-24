function statusMeaning(code) {
  if (code >= 200 && code < 300) {
    return "success";
  }
  if (code >= 400 && code < 500) {
    return "client error";
  }
  if (code >= 500 && code < 600) {
    return "server error";
  }
  return "other";
}

console.log("201:", statusMeaning(201));
console.log("404:", statusMeaning(404));
console.log("500:", statusMeaning(500));
