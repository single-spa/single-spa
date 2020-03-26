let bootstrapped;

export function bootstrap() {
  return new Promise((resolve) => {
    bootstrapped = true;
    resolve();
  });
}

export function unmount() {
  return new Promise((resolve) => resolve());
}

export function reset() {
  return (bootstrapped = false);
}

export function isBootstrapped() {
  return bootstrapped;
}
