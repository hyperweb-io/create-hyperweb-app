export default class Contract {
  private state: { value: number };

  constructor() { }

  reset(): number {
    this.state.value = 0;
    return this.state.value;
  }

  init(): number {
    this.state.value = 0;
    return this.state.value;
  }

  inc(): number {
    const oldValue = this.state.value || 0;
    const newValue = oldValue + 1;
    this.state.value = newValue;
    return this.state.value;
  }

  dec(): number {
    const oldValue = this.state.value ?? 0;
    const newValue = oldValue - 1;
    this.state.value = newValue;
    return newValue;
  }

  read(): number {
    return this.state.value;
  }

}
