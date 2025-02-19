export interface State {
  value: number;
}

export default class Contract {
  state: State;

  constructor() {
    console.log("[Contract] constructor called");
    this.state.value = 0;
  }

  reset() {
    console.log("[Contract] reset called");
    this.state.value = 0;
  }

  inc(x: number) {
    console.log("[Contract] inc called");
    this.state.value += x;
  }

  dec(x: number) {
    console.log("[Contract] dec called");
    this.state.value -= x;
  }

  read() {
    console.log("[Contract] read called");
    return this.state.value;
  }
}
