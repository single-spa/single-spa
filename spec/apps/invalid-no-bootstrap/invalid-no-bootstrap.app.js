let mounted;

export function mount() {
  return new Promise((resolve) => {
    mounted = true;
  });
}

export function unmount() {
  return new Promise((resolve) => {
    mounted = false;
  });
}

export function reset() {
  mounted = false;
}

export function isMounted() {
  return mounted;
}
