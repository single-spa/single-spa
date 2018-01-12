import { NOT_BOOTSTRAPPED, BOOTSTRAPPING, NOT_MOUNTED, SKIP_BECAUSE_BROKEN, getAppProps } from '../app.helpers.js';
import { reasonableTime } from '../timeouts.js';
import { handleAppError } from '../app-errors.js';

export async function toBootstrapPromise(app) {
  if (app.status !== NOT_BOOTSTRAPPED) {
    return app;
  }

  app.status = BOOTSTRAPPING;

  try {
    await reasonableTime(app.bootstrap(getAppProps(app)), `Bootstrapping app '${app.name}'`, app.timeouts.bootstrap);
    app.status = NOT_MOUNTED;
  } catch(err) {
    app.status = SKIP_BECAUSE_BROKEN;
    handleAppError(err, app);
  }

  return app;
}
