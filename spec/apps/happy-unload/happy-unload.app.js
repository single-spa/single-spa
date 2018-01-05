let numBootstrapCalls = 0, numMountCalls = 0, numUnloadCalls = 0, numUnmountCalls = 0;

export function reset() {
  numBootstrapCalls = 0;
  numMountCalls = 0;
  numUnloadCalls = 0;
  numUnmountCalls = 0;
}

export async function bootstrap() {
  numBootstrapCalls++;
}
export async function mount() {
  numMountCalls++;
}
export async function unmount() {
  numUnmountCalls++;
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
