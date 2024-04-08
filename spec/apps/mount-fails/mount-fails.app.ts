let bootstrapped, mounted, unmounted;

export function bootstrap() {
  return Promise.resolve().then(() => {
    bootstrapped = true;
  });
}

export function mount() {
  return Promise.resolve().then(() => {
    mounted = true;
    throw Error("mount failed");
  });
}

export function unmount() {
  return Promise.resolve().then(() => {
    unmounted = true;
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
