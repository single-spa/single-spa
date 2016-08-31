import { NOT_MOUNTED, MOUNTED, SKIP_BECAUSE_BROKEN } from '../child-app.helpers.js';
import { handleChildAppError } from '../child-app-errors.js';
import { reasonableTime } from '../timeouts.js';

export async function toMountPromise(app) {
	if (app.status !== NOT_MOUNTED) {
		return app;
	}
	try {
		await reasonableTime(app.mount(), `Mounting application ${app.name}'`, app.timeouts.mount);
		app.status = MOUNTED;
	} catch (err) {
		handleChildAppError(err, app);
		app.status = SKIP_BECAUSE_BROKEN;
	}

	return app;
}
