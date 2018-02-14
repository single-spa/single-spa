import { reroute } from './navigation/reroute.js';

export let started = false;

export function start() {
  started = true;
  reroute();
}

export function isStarted() {
  return started;
}

const startWarningDelay = 5000;

setTimeout(() => {
  if (!started) {
    console.warn(`singleSpa.start() has not been called, ${startWarningDelay}ms after single-spa was loaded. Before start() is called, apps can be declared and loaded, but not bootstrapped or mounted. See https://github.com/CanopyTax/single-spa/blob/master/docs/single-spa-api.md#start`);
  }
}, startWarningDelay)
