import { find } from "../utils/find.js";

export function validLifecycleFn(fn) {
  return fn && (typeof fn === "function" || isArrayOfFns(fn));

  function isArrayOfFns(arr) {
    return Array.isArray(arr) && !find(arr, item => typeof item !== "function");
  }
}

export function flattenFnArray(fns, description) {
  fns = Array.isArray(fns) ? fns : [fns];
  if (fns.length === 0) {
    fns = [() => Promise.resolve()];
  }

  return function(props) {
    return fns.reduce((resultPromise, fn, index) => {
      return resultPromise.then(() => {
        const thisPromise = fn(props);
        return smellsLikeAPromise(thisPromise)
          ? resultPromise.then(() => thisPromise)
          : resultPromise.then(() =>
              Promise.reject(
                `${description} at index ${index} did not return a promise`
              )
            );
      });
    }, Promise.resolve());
  };
}

export function smellsLikeAPromise(promise) {
  return (
    promise &&
    typeof promise.then === "function" &&
    typeof promise.catch === "function"
  );
}
