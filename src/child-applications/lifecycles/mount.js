import { NOT_MOUNTED, MOUNTED, SKIP_BECAUSE_BROKEN } from '../child-app.helpers.js';
import { handleChildAppError } from '../child-app-errors.js';
import { reasonableTime } from '../timeouts.js';
import CustomEvent from 'custom-event';

let beforeFirstMountFired = false;
let firstMountFired = false;

export function toMountPromise(app) {
	return Promise
		.resolve()
		.then(() => {
			if (app.status !== NOT_MOUNTED) {
				return app;
			}

			if (!beforeFirstMountFired) {
				window.dispatchEvent(new CustomEvent('single-spa:before-first-mount'));
				beforeFirstMountFired = true;
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

			if (!firstMountFired) {
				window.dispatchEvent(new CustomEvent('single-spa:first-mount'));
				firstMountFired = true;
			}

			return app;
		})
}
