import { NOT_BOOTSTRAPPED, BOOTSTRAPPING, NOT_MOUNTED, SKIP_BECAUSE_BROKEN } from '../child-app.helpers.js';
import { reasonableTime } from '../timeouts.js';
import { handleChildAppError } from 'src/child-applications/child-app-errors.js';

export async function toBootstrapPromise(app) {
	if (app.status !== NOT_BOOTSTRAPPED) {
		return app;
	}

	app.status = BOOTSTRAPPING;

	try {
		await reasonableTime(app.bootstrap({childAppName: app.name}), `Bootstrapping app '${app.name}'`, app.timeouts.bootstrap);
		app.status = NOT_MOUNTED;
	} catch(err) {
		app.status = SKIP_BECAUSE_BROKEN;
		handleChildAppError(err, app);
	}

	return app;
}
