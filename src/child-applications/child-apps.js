import { Loader } from '../loader.js';
import { ensureJQuerySupport } from '../jquery-support.js';
import { isActive, isLoaded, isntLoaded, toName, NOT_LOADED, shouldBeActive, shouldntBeActive, isntActive, notSkipped } from './child-app.helpers.js';
import { reroute } from 'src/navigation/reroute.js';
import { find } from 'src/utils/find.js';
import { toUnmountPromise } from 'src/child-applications/lifecycles/unmount.js';
import { toUnloadPromise, getAppUnloadInfo, addAppToUnload } from 'src/child-applications/lifecycles/unload.js';

const childApps = [];

export function getMountedApps() {
	return childApps.filter(isActive).map(toName);
}

export function getAppStatus(appName) {
	const app = find(childApps, app => app.name === appName);
	return app ? app.status : null;
}

export function declareChildApplication(appName, arg1, arg2) {
	if (typeof appName !== 'string' || appName.length === 0)
		throw new Error(`The first argument must be a non-empty string 'appName'`);
	if (childApps[appName])
		throw new Error(`There is already an app declared with name ${appName}`);

	let loadImpl, activeWhen;
	if (!arg2) {
		if (!Loader) {
			throw new Error(`You cannot declare a single-spa child application without either providing a way to load the application or a Loader. See https://github.com/CanopyTax/single-spa/blob/master/docs/single-spa-api.md#declarechildapplication`);
		}
		loadImpl = () => Loader.import(appName);
		activeWhen = arg1;
	} else {
		loadImpl = arg1;
		activeWhen = arg2;
	}
	if (typeof activeWhen !== 'function')
		throw new Error(`The activeWhen argument must be a function`);

	childApps.push({
		name: appName,
		loadImpl,
		activeWhen,
		status: NOT_LOADED,
	});

	ensureJQuerySupport();

	reroute();
}

export function getAppsToLoad() {
	return childApps
		.filter(shouldBeActive)
		.filter(notSkipped)
		.filter(isntLoaded)
}

export function getAppsToUnmount() {
	return childApps
		.filter(shouldntBeActive)
		.filter(notSkipped)
		.filter(isActive)
}

export function getAppsToMount() {
	return childApps
		.filter(shouldBeActive)
		.filter(notSkipped)
		.filter(isntActive)
		.filter(isLoaded)
}

export function unloadChildApplication(appName, opts={waitForUnmount: false}) {
	if (typeof appName !== 'string') {
		throw new Error(`unloadChildApplication requires a string 'appName'`);
	}
	const app = find(childApps, childApp => childApp.name === appName);
	if (!app) {
		throw new Error(`Could not unload child application '${appName}' because no such application has been declared`);
	}

	if (opts && opts.waitForUnmount) {
		const appUnloadInfo = getAppUnloadInfo(app.name);
		if (appUnloadInfo) {
			return appUnloadInfo.promise;
		} else {
			const promise = new Promise((resolve, reject) => {
				addAppToUnload(app, promise, resolve, reject);
			});
			return promise;
		}
	} else {
		const promise = new Promise((resolve, reject) => {
			addAppToUnload(app, promise, resolve, reject);

			toUnmountPromise(app)
				.then(toUnloadPromise)
				.then(() => {
					resolve()
					setTimeout(() => {
						// reroute, but the unload promise is done
						reroute()
					});
				})
				.catch(reject);
		});

		return promise;
	}
}
