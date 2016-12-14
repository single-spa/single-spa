import { UNMOUNTING, NOT_MOUNTED, MOUNTED, SKIP_BECAUSE_BROKEN } from '../child-app.helpers.js';
import { handleChildAppError } from '../child-app-errors.js';
import { reasonableTime } from '../timeouts.js';

export async function toUnmountPromise(app) {
	if (app.status !== MOUNTED) {
		return app;
	}
	app.status = UNMOUNTING;

	try {
		await reasonableTime(app.unmount({childAppName: app.name}), `Unmounting application ${app.name}'`, app.timeouts.unmount);
		app.status = NOT_MOUNTED;
	} catch (err) {
		handleChildAppError(err, app);
		app.status = SKIP_BECAUSE_BROKEN;
	}

	return app;
}
