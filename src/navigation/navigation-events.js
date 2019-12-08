import { reroute } from "./reroute.js";
import { find } from "../utils/find.js";
import { formatErrorMessage } from "../applications/app-errors.js";

/* We capture navigation event listeners so that we can make sure
 * that application navigation listeners are not called until
 * single-spa has ensured that the correct applications are
 * unmounted and mounted.
 */
const capturedEventListeners = {
  hashchange: [],
  popstate: []
};

export const routingEventsListeningTo = ["hashchange", "popstate"];

export function navigateToUrl(obj) {
  let url;
  if (typeof obj === "string") {
    url = obj;
  } else if (this && this.href) {
    url = this.href;
  } else if (
    obj &&
    obj.currentTarget &&
    obj.currentTarget.href &&
    obj.preventDefault
  ) {
    url = obj.currentTarget.href;
    obj.preventDefault();
  } else {
    throw Error(
      formatErrorMessage(
        14,
        __DEV__ &&
          `singleSpaNavigate must be either called with a string url, with an <a> tag as its context, or with an event whose currentTarget is an <a> tag`
      )
    );
  }

  const current = parseUri(window.location.href);
  const destination = parseUri(url);

  if (url.indexOf("#") === 0) {
    window.location.hash = destination.hash;
  } else if (current.host !== destination.host && destination.host) {
    if (process.env.BABEL_ENV === "test") {
      return { wouldHaveReloadedThePage: true };
    } else {
      window.location.href = url;
    }
  } else if (
    destination.pathname === current.pathname &&
    destination.search === current.pathname
  ) {
    window.location.hash = destination.hash;
  } else {
    // different path, host, or query params
    window.history.pushState(null, null, url);
  }
}

export function callCapturedEventListeners(eventArguments) {
  if (eventArguments) {
    const eventType = eventArguments[0].type;
    if (routingEventsListeningTo.indexOf(eventType) >= 0) {
      capturedEventListeners[eventType].forEach(listener => {
        listener.apply(this, eventArguments);
      });
    }
  }
}

function urlReroute() {
  reroute([], arguments);
}

// We will trigger an app change for any routing events.
window.addEventListener("hashchange", urlReroute);
window.addEventListener("popstate", urlReroute);

// Monkeypatch addEventListener so that we can ensure correct timing
const originalAddEventListener = window.addEventListener;
const originalRemoveEventListener = window.removeEventListener;
window.addEventListener = function(eventName, fn) {
  if (typeof fn === "function") {
    if (
      routingEventsListeningTo.indexOf(eventName) >= 0 &&
      !find(capturedEventListeners[eventName], listener => listener === fn)
    ) {
      capturedEventListeners[eventName].push(fn);
      return;
    }
  }

  return originalAddEventListener.apply(this, arguments);
};

window.removeEventListener = function(eventName, listenerFn) {
  if (typeof listenerFn === "function") {
    if (routingEventsListeningTo.indexOf(eventName) >= 0) {
      capturedEventListeners[eventName] = capturedEventListeners[
        eventName
      ].filter(fn => fn !== listenerFn);
      return;
    }
  }

  return originalRemoveEventListener.apply(this, arguments);
};

const originalPushState = window.history.pushState;
window.history.pushState = function(state) {
  const result = originalPushState.apply(this, arguments);

  urlReroute(createPopStateEvent(state));

  return result;
};

const originalReplaceState = window.history.replaceState;
window.history.replaceState = function(state) {
  const result = originalReplaceState.apply(this, arguments);
  urlReroute(createPopStateEvent(state));
  return result;
};

function createPopStateEvent(state) {
  // https://github.com/CanopyTax/single-spa/issues/224 and https://github.com/CanopyTax/single-spa-angular/issues/49
  // We need a popstate event even though the browser doesn't do one by default when you call replaceState, so that
  // all the applications can reroute.
  try {
    return new PopStateEvent("popstate", { state });
  } catch (err) {
    // IE 11 compatibility https://github.com/CanopyTax/single-spa/issues/299
    // https://docs.microsoft.com/en-us/openspecs/ie_standards/ms-html5e/bd560f47-b349-4d2c-baa8-f1560fb489dd
    const evt = document.createEvent("PopStateEvent");
    evt.initPopStateEvent("popstate", false, false, state);
    return evt;
  }
}

/* For convenience in `onclick` attributes, we expose a global function for navigating to
 * whatever an <a> tag's href is.
 */
window.singleSpaNavigate = navigateToUrl;

function parseUri(str) {
  const anchor = document.createElement("a");
  anchor.href = str;
  return anchor;
}
