import { reroute } from "./navigation/reroute.js";
import {
  patchHistoryApi,
  setUrlRerouteOnly,
} from "./navigation/navigation-events.js";
import { isInBrowser } from "./utils/runtime-environment.js";

let started = false;

export function start(opts) {
  started = true;
  if (opts && opts.urlRerouteOnly) {
    setUrlRerouteOnly(opts.urlRerouteOnly);
  }
  if (isInBrowser) {
    reroute();
    patchHistoryApi();
  }
}

export function stop() {
  started = false;
}

export function isStarted() {
  return started;
}
