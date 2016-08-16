import { ensureJQuerySupport } from '../jquery-support.js';
import { isActive, isLoaded, isntLoaded, toLocation, NOT_LOADED, shouldBeActive, shouldntBeActive, isntActive, notSkipped } from './child-app.helpers.js';
import { reroute } from 'src/navigation/reroute.js';
import { find } from 'src/utils/find.js';

const childApps = [];

export function getMountedApps() {
	return childApps.filter(isActive).map(toLocation);
}

export function getAppStatus(appName) {
	const app = find(childApps, app => app.appLocation === appName);
	return app ? app.status : null;
}

export function declareChildApplication(appLocation, activeWhen) {
    if (typeof appLocation !== 'string' || appLocation.length === 0)
        throw new Error(`The first argument must be a non-empty string 'appLocation'`);
    if (typeof activeWhen !== 'function')
        throw new Error(`The second argument must be a function 'activeWhen'`);
    if (childApps[appLocation])
        throw new Error(`There is already an app declared at location ${appLocation}`);

    childApps.push({
        appLocation: appLocation,
        activeWhen: activeWhen,
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
