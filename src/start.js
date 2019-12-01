import { reroute } from "./navigation/reroute.js";

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
      `singleSpa.start() has not been called, 5000ms after single-spa was loaded. Before start() is called, apps can be declared and loaded, but not bootstrapped or mounted. See https://github.com/CanopyTax/single-spa/blob/master/docs/single-spa-api.md#start`
    );
  }
}, 5000);
