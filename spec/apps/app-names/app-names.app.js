export let bootstrapped, mounted;

export function bootstrap() {
  return new Promise(resolve => {
    bootstrapped = true;
    resolve();
  });
}

export function mount() {
  return new Promise(resolve => {
    mounted = true;
    resolve();
  });
}

export function unmount() {
  return new Promise(resolve => {
    mounted = false;
    resolve()
  });
}

export function reset() {
  bootstrapped = false;
  mounted = false;
}

export function wasBootstrapped() {
  return bootstrapped;
}

export function isMounted() {
  return mounted;
}
