import { MappingStore, State, Store } from "./types";

export function useStore<ValueType>(key: string, defaultValue: ValueType): Store<ValueType> {
  return (state: State) => [
    () => state.get(key) ?? defaultValue,
    (value: ValueType) => state.set(key, value)
  ]
}

export function useMapping<Params extends any[], ValueType>(keys: string[], defaultValue: ValueType): MappingStore<Params, ValueType> {
  return (state: State) => [
    (...args: Params) => {
      // assert: keys.length === args.length + 1
      const interleavedKey = [keys[0]];
      const pathKeys = keys.slice(1);
      for(let i = 0; i < pathKeys.length; i++) {
        interleavedKey.push(pathKeys[i], args[i]);
      }
      return state.get(interleavedKey.join('/')) ?? defaultValue;
    },
    (...args: [...Params, ValueType]) => {
      const interleavedKey = [keys[0]];
      const pathKeys = keys.slice(1);
      const keyArgs = args.slice(0, -1) as Params;
      for(let i = 0; i < pathKeys.length; i++) {
        interleavedKey.push(pathKeys[i], keyArgs[i]);
      }
      state.set(interleavedKey.join('/'), args[args.length - 1]);
    }
  ]
}
