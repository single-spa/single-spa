import { reroute } from "./navigation/reroute.js";
import { formatErrorMessage } from "./applications/app-errors.js";

let started = false;

export function start() {
  started = true;
  reroute();
}

export function isStarted() {
  return started;
}

setTimeout(() => {
  if (!started) {
    console.warn(
      formatErrorMessage(
        1,
        __DEV__ &&
          `singleSpa.start() has not been called, 5000ms after single-spa was loaded. Before start() is called, apps can be declared and loaded, but not bootstrapped or mounted.`
      )
    );
  }
}, 5000);
