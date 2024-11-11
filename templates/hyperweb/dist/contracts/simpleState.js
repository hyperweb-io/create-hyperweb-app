// src/simple-state/index.ts
function reset(state) {
  const newValue = 0;
  state.set("value", newValue);
  return newValue;
}
function inc(state, { x }) {
  const oldValue = Number(state.get("value")) || 0;
  const newValue = oldValue + x;
  state.set("value", newValue);
  return newValue;
}
function dec(state, { x }) {
  const oldValue = Number(state.get("value")) || 0;
  const newValue = oldValue - x;
  state.set("value", newValue);
  return newValue;
}
function read(state) {
  return state.get("value");
}
export {
  dec,
  inc,
  read,
  reset
};
//# sourceMappingURL=simpleState.js.map
