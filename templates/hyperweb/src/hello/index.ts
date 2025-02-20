export default class Contract {
    state: {
        msg?: string | boolean | null;
    } = {};

    constructor() { }

    hello(x: string) {
        this.state.msg = x;
        return `Hello, ${String(this.state.msg)}`;
    }
}
