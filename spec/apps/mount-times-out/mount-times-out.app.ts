let numBootstraps, numMounts, numUnmounts;

export const timeouts = {
  mount: {
    dieOnTimeout: false,
    millis: 20,
  },
};

export function bootstrap() {
  return new Promise((resolve) => {
    numBootstraps++;
    resolve();
  });
}

export function mount() {
  return new Promise((resolve) => {
    numMounts++;
    setTimeout(resolve, 40);
  });
}

export function unmount() {
  return new Promise((resolve) => {
    numUnmounts++;
    resolve();
  });
}

export function reset() {
  numBootstraps = numMounts = numUnmounts = 0;
}

export function bootstraps() {
  return numBootstraps;
}

export function mounts() {
  return numMounts;
}
