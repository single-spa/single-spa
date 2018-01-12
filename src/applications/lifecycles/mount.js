import { NOT_MOUNTED, MOUNTED, SKIP_BECAUSE_BROKEN, getAppProps } from '../app.helpers.js';
import { handleAppError } from '../app-errors.js';
import { reasonableTime } from '../timeouts.js';
import CustomEvent from 'custom-event';

let beforeFirstMountFired = false;
let firstMountFired = false;

export async function toMountPromise(app) {
  if (app.status !== NOT_MOUNTED) {
    return app;
  }

  if (!beforeFirstMountFired) {
    window.dispatchEvent(new CustomEvent('single-spa:before-first-mount'));
    beforeFirstMountFired = true;
  }

  try {
    await reasonableTime(app.mount(getAppProps(app)), `Mounting application '${app.name}'`, app.timeouts.mount);
    app.status = MOUNTED;
  } catch (err) {
    handleAppError(err, app);
    app.status = SKIP_BECAUSE_BROKEN;
  }

  if (!firstMountFired) {
    window.dispatchEvent(new CustomEvent('single-spa:first-mount'));
    firstMountFired = true;
  }

  return app;
}
