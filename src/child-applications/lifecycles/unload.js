import { NOT_MOUNTED, UNLOADING, NOT_LOADED, SKIP_BECAUSE_BROKEN } from '../child-app.helpers.js';
import { handleChildAppError } from '../child-app-errors.js';
import { reasonableTime } from '../timeouts.js';
import { isntActive } from '../child-app.helpers.js';

const appsToUnload = {};

export async function toUnloadPromise(app) {
	const unloadInfo = appsToUnload[app.name];

	if (app.status === NOT_LOADED) {
		/* This app is already unloaded. We just need to clean up
		 * anything that still thinks we need to unload the app.
		 */
		finishUnloadingApp(app, unloadInfo);
		return;
	}

	if (app.status !== NOT_MOUNTED || !unloadInfo) {
		/* Either no one has called unloadChildApplication for this app,
		 * or it's not in a status where it can be unloaded.
		 */
		return;
	}

	try {
		app.status = UNLOADING;
		await reasonableTime(app.unload(), `Unloading application '${app.name}'`, app.timeouts.unload);
	} catch (err) {
		handleChildAppError(err, app);
		app.status = SKIP_BECAUSE_BROKEN;
		unloadInfo.reject(err);
		return app;
	}

	finishUnloadingApp(app, unloadInfo);

	return app;
}

function finishUnloadingApp(app, unloadInfo) {
	delete appsToUnload[app.name];

	// Unloaded apps don't have lifecycles
	delete app.bootstrap;
	delete app.mount;
	delete app.unmount;
	delete app.unload;

	app.status = NOT_LOADED;

	/* resolve the promise of whoever called unloadChildApplication.
	 * This should be done after all other cleanup/bookkeeping
	 */
	unloadInfo.resolve();
}

export function addAppToUnload(app, promise, resolve=()=>{}, reject=()=>{}) {
	appsToUnload[app.name] = {app, promise, resolve, reject};
}

export function getAppUnloadInfo(appName) {
	return appsToUnload[appName];
}

export function getAppsToUnload() {
	return Object.keys(appsToUnload)
		.map(appName => appsToUnload[appName].app)
		.filter(isntActive)
}
