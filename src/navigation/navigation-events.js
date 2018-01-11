import { reroute } from './reroute.js';
import { find } from 'src/utils/find.js';

/* We capture navigation event listeners so that we can make sure
 * that application navigation listeners are not called until
 * single-spa has ensured that the correct applications are
 * unmounted and mounted.
 */
const capturedEventListeners = {
  hashchange: [],
  popstate: [],
};

export const routingEventsListeningTo = ['hashchange', 'popstate'];

export function navigateToUrl(obj, opts={}) {
  let url;
  if (typeof obj === 'string') {
    url = obj ;
  } else if (this && this.href) {
    url = this.href;
  } else if (obj && obj.currentTarget && obj.currentTarget.href && obj.preventDefault) {
    url = obj.currentTarget.href;
    obj.preventDefault();
  } else {
    throw new Error(`singleSpaNavigate must be either called with a string url, with an <a> tag as its context, or with an event whose currentTarget is an <a> tag`);
  }

  const current = parseUri(window.location.href);
  const destination = parseUri(url);

  if (url.indexOf('#') === 0) {
    window.location.hash = '#' + destination.anchor;
  } else if (current.host !== destination.host && destination.host) {
    if (opts.isTestingEnv) {
      return {wouldHaveReloadedThePage: true};
    } else {
      window.location.href = url;
    }
  } else if (!isSamePath(destination.path, current.path)) {
    // different path or a different host
    window.history.pushState(null, null, url);
  } else {
    window.location.hash = '#' + destination.anchor;
  }

  function isSamePath(destination, current) {
    // if the destination has a path but no domain, it doesn't include the root '/'
    return current === destination || current === '/' + destination;
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
  reroute([], arguments)
}


// We will trigger an app change for any routing events.
window.addEventListener('hashchange', urlReroute);
window.addEventListener('popstate', urlReroute);

// Monkeypatch addEventListener so that we can ensure correct timing
const originalAddEventListener = window.addEventListener;
const originalRemoveEventListener = window.removeEventListener;
window.addEventListener = function(eventName, fn) {
  if (typeof fn === 'function') {
    if (routingEventsListeningTo.indexOf(eventName) >= 0 && !find(capturedEventListeners[eventName], listener => listener === fn)) {
      capturedEventListeners[eventName].push(fn);
      return;
    }
  }

  return originalAddEventListener.apply(this, arguments);
}

window.removeEventListener = function(eventName, listenerFn) {
  if (typeof listenerFn === 'function') {
    if (routingEventsListeningTo.indexOf(eventName) >= 0) {
      capturedEventListeners[eventName] = capturedEventListeners[eventName].filter(fn => fn !== listenerFn);
      return;
    }
  }

  return originalRemoveEventListener.apply(this, arguments);
}

const originalPushState = window.history.pushState;
window.history.pushState = function(state) {
  const result = originalPushState.apply(this, arguments);

  reroute();
  
  return result;
}

const originalReplaceState = window.history.replaceState;
window.history.replaceState = function() {
  const result = originalReplaceState.apply(this, arguments);
  reroute();
  return result;
}

/* For convenience in `onclick` attributes, we expose a global function for navigating to
 * whatever an <a> tag's href is.
 */
window.singleSpaNavigate = navigateToUrl;

function parseUri(str) {
  // parseUri 1.2.2
  // (c) Steven Levithan <stevenlevithan.com>
  // MIT License
  // http://blog.stevenlevithan.com/archives/parseuri
  const parseOptions = {
    strictMode: true,
    key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
    q:   {
      name:   "queryKey",
      parser: /(?:^|&)([^&=]*)=?([^&]*)/g
    },
    parser: {
      strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
      loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    }
  };

  let  o = parseOptions;
  let m = o.parser[o.strictMode ? "strict" : "loose"].exec(str);
  let uri = {};
  let i = 14;

  while (i--) uri[o.key[i]] = m[i] || "";

  uri[o.q.name] = {};
  uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
    if ($1) uri[o.q.name][$1] = $2;
  });

  return uri;
}
