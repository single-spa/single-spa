import { NOT_MOUNTED, MOUNTED, SKIP_BECAUSE_BROKEN } from '../child-app.helpers.js';
import { handleChildAppError } from '../child-app-errors.js';
import { reasonableTime } from '../timeouts.js';

export function toMountPromise(app) {
	return Promise
		.resolve()
		.then(() => {
			if (app.status !== NOT_MOUNTED) {
				return app;
			}

			return reasonableTime(app.mount({childAppName: app.name}), `Mounting application '${app.name}'`, app.timeouts.mount);
		})
		.then(() => {
			app.status = MOUNTED;
			return app;
		})
		.catch(err => {
			handleChildAppError(err, app);
			app.status = SKIP_BECAUSE_BROKEN;
			return app;
		})
}
