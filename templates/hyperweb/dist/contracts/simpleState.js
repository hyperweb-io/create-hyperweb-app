// src/simple-state/index.ts
var Contract = class {
  state;
  constructor() {
    console.log("[Contract] constructor called");
  }
  reset() {
    console.log("[Contract] reset called");
    this.state.value = 0;
  }
  init() {
    console.log("[Contract] init called");
    this.state.value = 0;
  }
  inc(x) {
    console.log("[Contract] inc called");
    this.state.value += x;
  }
  dec(x) {
    console.log("[Contract] dec called");
    this.state.value -= x;
  }
  read() {
    console.log("[Contract] read called");
    return this.state.value;
  }
};
export {
  Contract as default
};
//# sourceMappingURL=simpleState.js.map
