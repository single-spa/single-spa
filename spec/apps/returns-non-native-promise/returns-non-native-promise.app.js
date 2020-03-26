let _wasBootstrapped, _wasMounted, _wasUnmounted;

export function reset() {
  _wasBootstrapped = _wasMounted = _wasUnmounted = false;
}

export function bootstrap() {
  _wasBootstrapped = true;
  return nonNativePromise();
}

export function mount() {
  _wasMounted = true;
  return nonNativePromise();
}

export function unmount() {
  _wasUnmounted = true;
  return nonNativePromise();
}

export function wasBootstrapped() {
  return _wasBootstrapped;
}

export function wasMounted() {
  return _wasMounted;
}

export function wasUnmounted() {
  return _wasUnmounted;
}

function nonNativePromise() {
  return {
    then(callback) {
      callback();
      return this;
    },
    catch(callback) {
      return this;
    },
  };
}
