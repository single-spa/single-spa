import { UNMOUNTING, NOT_MOUNTED, MOUNTED, SKIP_BECAUSE_BROKEN } from '../child-app.helpers.js';
import { handleChildAppError } from '../child-app-errors.js';
import { reasonableTime } from '../timeouts.js';

export function toUnmountPromise(app) {
	return Promise
		.resolve()
		.then(() => {
			if (app.status !== MOUNTED) {
				return;
			}
			app.status = UNMOUNTING;

			return reasonableTime(app.unmount({childAppName: app.name}), `Unmounting application ${app.name}'`, app.timeouts.unmount);
		})
		.catch(err => {
			handleChildAppError(err, app);
			app.status = SKIP_BECAUSE_BROKEN;
		})
		.then(() => {
			app.status = NOT_MOUNTED;
		})
		.then(() => {
			return app;
		});
}
