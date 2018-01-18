import { NOT_BOOTSTRAPPED, BOOTSTRAPPING, NOT_MOUNTED, SKIP_BECAUSE_BROKEN } from '../app.helpers.js';
import { reasonableTime } from '../timeouts.js';
import { handleAppError } from '../app-errors.js';
import { getProps } from './prop.helpers.js'

export async function toBootstrapPromise(app) {
  if (app.status !== NOT_BOOTSTRAPPED) {
    return app;
  }

  app.status = BOOTSTRAPPING;

  try {
    await reasonableTime(app.bootstrap(getProps(app)), `Bootstrapping app '${app.name}'`, app.timeouts.bootstrap);
    app.status = NOT_MOUNTED;
  } catch(err) {
    app.status = SKIP_BECAUSE_BROKEN;
    handleAppError(err, app);
  }

  return app;
}
