let delay = 0;

export function bootstrap() {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}

export function mount() {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}

export function unmount() {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}

export const timeouts = {
  bootstrap: {
    warningMillis: 2,
  },
  mount: {
    warningMillis: 2,
  },
  unmount: {
    warningMillis: 2,
  },
  unload: {
    warningMillis: 2,
  },
};

export function reset() {
  delay = 0;
}

export function setDelay(millis) {
  delay = millis;
}
