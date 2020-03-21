export let bootstrapped, mounted;

export async function bootstrap() {
  bootstrapped = true;
}

export async function mount() {
  mounted = true;
}

export async function unmount() {
  mounted = false;
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
