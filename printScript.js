window.addEventListener("load", () => {
  window.print();
  window.parent?.postMessage("close", "*");
});
