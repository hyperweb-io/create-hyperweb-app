export interface State {
  get(key: string): string;
  set(key: string, value: any): void;
}

export interface Msg {
  sender: string;
  sent_funds: { [key: string]: number };
}

export type MappingStore<Params extends any[], ValueType> = (state: State) => [
  (...args: Params) => ValueType, 
  (...args: [...Params, ValueType]) => void,
]

export type Store<ValueType> = (state: State) => [
  () => ValueType,
  (value: ValueType) => void,
]
