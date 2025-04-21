// src/hello/index.ts
var Contract = class {
  state;
  constructor() {
  }
  hello(x) {
    this.state.msg = x;
    return `Hello, ${String(this.state.msg)}`;
  }
};
export {
  Contract as default
};
//# sourceMappingURL=hello.js.map
