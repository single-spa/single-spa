let bootstrapped, mounted, unmounted;

export function bootstrap() {
  return new Promise((resolve) => {
    bootstrapped = true;
    resolve();
  });
}

export function mount() {
  return new Promise((resolve, reject) => {
    mounted = true;
    reject(`mount-rejects app rejected the mount lifecycle`);
  });
}

export function unmount() {
  return new Promise((resolve) => {
    unmounted = true;
    resolve();
  });
}

export function reset() {
  bootstrapped = false;
  mounted = false;
  unmounted = false;
}

export function wasBootstrapped() {
  return bootstrapped;
}

export function wasMounted() {
  return mounted;
}

export function wasUnmounted() {
  return unmounted;
}
