import { getRawAppData, unregisterApplication } from "../applications/apps";
import { reroute } from "../navigation/reroute";
import { NOT_LOADED } from "../applications/app.helpers";
import { toLoadPromise } from "../lifecycles/load";
import { toBootstrapPromise } from "../lifecycles/bootstrap";

export default {
  getRawAppData,
  reroute,
  NOT_LOADED,
  toLoadPromise,
  toBootstrapPromise,
  unregisterApplication,
};
