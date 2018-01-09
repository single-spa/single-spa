import { NOT_BOOTSTRAPPED, BOOTSTRAPPING, NOT_MOUNTED, SKIP_BECAUSE_BROKEN } from '../child-app.helpers.js';
import { reasonableTime } from '../timeouts.js';
import { handleChildAppError } from 'src/child-applications/child-app-errors.js';

export function toBootstrapPromise(app) {
	return Promise
		.resolve()
		.then(() => {
			if (app.status !== NOT_BOOTSTRAPPED) {
				return app;
			}

			app.status = BOOTSTRAPPING;

			return reasonableTime(app.bootstrap({childAppName: app.name}), `Bootstrapping app '${app.name}'`, app.timeouts.bootstrap);
		})
		.then(() => {
			app.status = NOT_MOUNTED;
			return app;
		})
		.catch(err => {
			app.status = SKIP_BECAUSE_BROKEN;
			handleChildAppError(err, app);
			return app;
		});
}
