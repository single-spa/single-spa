let numBootstrapCalls = 0,
  numMountCalls = 0,
  numUnloadCalls = 0,
  numUnmountCalls = 0;

export function reset() {
  numBootstrapCalls = 0;
  numMountCalls = 0;
  numUnloadCalls = 0;
  numUnmountCalls = 0;
}

export function bootstrap() {
  numBootstrapCalls++;
  return Promise.resolve();
}
// Commenting this code is what causes the SKIP_BECAUSE_BROKEN, as needed for the spec.js to function as expected
// export function mount() {
//   numMountCalls++;
//   return Promise.resolve();
// }
export function unmount() {
  numUnmountCalls++;
  return Promise.resolve();
}
export function unload() {
  numUnloadCalls++;
  return Promise.resolve();
}
export function getNumBootstrapCalls() {
  return numBootstrapCalls;
}
export function getNumMountCalls() {
  return numMountCalls;
}
export function getNumUnloadCalls() {
  return numUnloadCalls;
}

export function getNumUnmountCalls() {
  return numUnmountCalls;
}
