export interface State {
  get(key: string): any;
  set(key: string, value: any): void;
}

export interface StateEntries {
  totalSupply: number;
  balance: (address: string) => number;
  reserves: [number, number];
}

export interface Msg {
  sender: string;
  sent_funds: { [key: string]: number };
}
