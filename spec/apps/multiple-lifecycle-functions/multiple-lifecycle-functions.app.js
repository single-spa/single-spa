let _bootstrapsCalledOutOfOrder = undefined;
let _mountsCalledOutOfOrder = undefined;
let _unmountsCalledOutOfOrder = undefined;

let _bootstrap1Called = false;
let _bootstrap2Called = false;
let _bootstrap3Called = false;
let _mount1Called = false;
let _mount2Called = false;
let _mount3Called = false;
let _unmount1Called = false;
let _unmount2Called = false;
let _unmount3Called = false;

export const bootstrap = [
  function bootstrap1() {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (_bootstrap2Called)
          _bootstrapsCalledOutOfOrder = `bootstrap 2 called before bootstrap 1`;
        if (_bootstrap3Called)
          _bootstrapsCalledOutOfOrder = `bootstrap 3 called before bootstrap 1`;
        _bootstrap1Called = true;
        resolve();
      }, 10);
    });
  },

  function bootstrap2() {
    return new Promise((resolve) => {
      if (_bootstrap3Called)
        _bootstrapsCalledOutOfOrder = `bootstrap 2 called before bootstrap 3`;
      _bootstrap2Called = true;
      resolve();
    });
  },

  function bootstrap3() {
    return new Promise((resolve) => {
      _bootstrap3Called = true;
      resolve();
    });
  },
];

export const mount = [
  function mount1() {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (_mount2Called)
          _mountsCalledOutOfOrder = `mount 2 called before mount 1`;
        if (_mount3Called)
          _mountsCalledOutOfOrder = `mount 3 called before mount 1`;
        _mount1Called = true;
        resolve();
      }, 10);
    });
  },

  function mount2() {
    return new Promise((resolve) => {
      if (_mount3Called)
        _mountsCalledOutOfOrder = `mount 2 called before mount 3`;
      _mount2Called = true;
      resolve();
    });
  },

  function mount3() {
    return new Promise((resolve) => {
      _mount3Called = true;
      resolve();
    });
  },
];

export const unmount = [
  function unmount1() {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (_unmount2Called)
          _unmountsCalledOutOfOrder = `unmount 2 called before unmount 1`;
        if (_unmount3Called)
          _unmountsCalledOutOfOrder = `unmount 3 called before unmount 1`;
        _unmount1Called = true;
        resolve();
      }, 10);
    });
  },

  function unmount2() {
    return new Promise((resolve) => {
      if (_unmount3Called)
        _unmountsCalledOutOfOrder = `unmount 2 called before unmount 3`;
      _unmount2Called = true;
      resolve();
    });
  },

  function unmount3() {
    return new Promise((resolve) => {
      _unmount3Called = true;
      resolve();
    });
  },
];

export function reset() {
  _bootstrapsCalledOutOfOrder = _mountsCalledOutOfOrder = _unmountsCalledOutOfOrder = undefined;
  _bootstrap1Called = _bootstrap2Called = _bootstrap3Called = _mount1Called = _mount2Called = _mount3Called = _unmount1Called = _unmount2Called = _unmount3Called = false;
}

export function bootstrapsCalledOutOfOrder() {
  return _bootstrapsCalledOutOfOrder;
}

export function mountsCalledOutOfOrder() {
  return _mountsCalledOutOfOrder;
}

export function unmountsCalledOutOfOrder() {
  return _unmountsCalledOutOfOrder;
}

export function bootstrap1Called() {
  return _bootstrap1Called;
}

export function bootstrap2Called() {
  return _bootstrap2Called;
}

export function bootstrap3Called() {
  return _bootstrap3Called;
}

export function mount1Called() {
  return _mount1Called;
}

export function mount2Called() {
  return _mount2Called;
}

export function mount3Called() {
  return _mount3Called;
}

export function unmount1Called() {
  return _unmount1Called;
}

export function unmount2Called() {
  return _unmount2Called;
}

export function unmount3Called() {
  return _unmount3Called;
}
