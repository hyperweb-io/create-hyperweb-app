import { State, StateEntries } from "./types";
import { storeEntry } from "./utils";

export function store<T>(stateEntries: T) {
  return (state: State): T => {
    let storeMap = {} as T;

    function defineStore(keys: string[], value: any) {
      if (typeof value === "function") {
        return (subkey: string) => {
          return defineStore([...keys, subkey], value(subkey));
        };
      }
      return storeEntry(state, keys, value);
    }

    Object.entries(stateEntries).forEach(([key, value]) => {
      (storeMap as any)[key] = defineStore([key], value);
    });

    return storeMap;
  };
}
