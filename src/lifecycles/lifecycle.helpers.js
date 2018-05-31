import { find } from 'src/utils/find.js';

export function validLifecycleFn(fn) {
  return fn && (typeof fn === 'function' || isArrayOfFns(fn));

  function isArrayOfFns(arr) {
    return Array.isArray(arr) && !find(arr, item => typeof item !== 'function');
  }
}

export function flattenFnArray(fns, description) {
  fns = Array.isArray(fns) ? fns : [fns];
  if (fns.length === 0) {
    fns = [() => Promise.resolve()];
  }

  return function(props) {
    return new Promise((resolve, reject) => {
      waitForPromises(0);

      function waitForPromises(index) {
        const promise = fns[index](props);
        if (!smellsLikeAPromise(promise)) {
          reject(`${description} at index ${index} did not return a promise`);
        } else {
          promise
            .then(() => {
              if (index === fns.length - 1) {
                resolve();
              } else {
                waitForPromises(index + 1);
              }
            })
            .catch(reject);
        }
      }
    });
  }
}

export function smellsLikeAPromise(promise) {
  return promise && typeof promise.then === 'function' && typeof promise.catch === 'function';
}
