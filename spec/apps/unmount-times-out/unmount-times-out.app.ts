let _numBootstraps, _numMounts, _numUnmounts;

export const timeouts = {
  unmount: {
    dieOnTimeout: false,
    millis: 20,
  },
};

export function bootstrap() {
  return new Promise((resolve) => {
    _numBootstraps++;
    resolve();
  });
}

export function mount() {
  return new Promise((resolve) => {
    _numMounts++;
    resolve();
  });
}

export function unmount() {
  return new Promise((resolve) => {
    _numUnmounts++;
    setTimeout(resolve, 40);
  });
}

export function reset() {
  _numBootstraps = _numMounts = _numUnmounts = 0;
}

export function numBootstraps() {
  return _numBootstraps;
}

export function numMounts() {
  return _numMounts;
}

export function numUnmounts() {
  return _numUnmounts;
}
