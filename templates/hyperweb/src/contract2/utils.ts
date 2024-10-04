import { State } from "./types";

export function storeEntry(state: State, keys: string[], value: any) {
  const key = keys.join("/");

  return {
    get value() {
      return state.get(key) ?? value;
    },

    set value(newValue) {
      state.set(key, newValue);
    },
  }
}
