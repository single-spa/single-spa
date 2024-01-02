import { reroute } from "./navigation/reroute.js";
import { patchHistoryApi } from "./navigation/navigation-events.js";
import { isInBrowser } from "./utils/runtime-environment.js";

let started: boolean = false;

export function start(opts: StartOpts) {
  started = true;
  if (isInBrowser) {
    patchHistoryApi(opts);
    reroute();
  }
}

export function isStarted(): boolean {
  return started;
}

interface StartOpts {
  urlRerouteOnly?: boolean;
}
