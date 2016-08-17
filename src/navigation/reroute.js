import CustomEvent from 'custom-event';
import { isStarted } from 'src/start.js';
import { toLoadPromise } from 'src/child-applications/lifecycles/load.js';
import { toBootstrapPromise } from 'src/child-applications/lifecycles/bootstrap.js';
import { toMountPromise} from 'src/child-applications/lifecycles/mount.js';
import { toUnmountPromise } from 'src/child-applications/lifecycles/unmount.js';
import { getMountedApps, getAppsToLoad, getAppsToUnmount, getAppsToMount } from 'src/child-applications/child-apps.js';
import { notSkipped } from 'src/child-applications/child-app.helpers.js';
import { callCapturedEventListeners } from './navigation-events.js';

let appChangeUnderway = false, peopleWaitingOnAppChange = [];

export function reroute(pendingPromises = [], eventArguments) {
	if (appChangeUnderway) {
		return new Promise((resolve, reject) => {
			peopleWaitingOnAppChange.push({
				resolve,
				reject,
			});
		});
	}

	appChangeUnderway = true;
	let wasNoOp = true;

	if (isStarted()) {
		return performAppChanges();
	} else {
		return loadApps();
	}

	async function loadApps() {
		const loadPromises = getAppsToLoad().map(toLoadPromise);

		if (loadPromises.length > 0) {
			wasNoOp = false;
		}

		try {
			await Promise.all(loadPromises);
		} catch(err) {
			callCapturedEventListeners(eventArguments);
			throw err;
		}

		return finishUpAndReturn();
	}

	async function performAppChanges() {
		const unmountPromises = getAppsToUnmount().map(toUnmountPromise);
		if (unmountPromises.length > 0) {
			wasNoOp = false;
		}
		const unmountAllPromise = Promise.all(unmountPromises);

		const appsToLoad = getAppsToLoad();

		/* We load and bootstrap apps while other apps are unmounting, but we
		 * wait to mount the app until all apps are finishing unmounting
		 */
		const loadThenMountPromises = appsToLoad.map(app => {
			return toLoadPromise(app)
				.then(toBootstrapPromise)
				.then(async function(app) {
					await unmountAllPromise;
					return toMountPromise(app);
				})
		})
		if (loadThenMountPromises.length > 0) {
			wasNoOp = false;
		}

		/* These are the apps that are already bootstrapped and just need
		 * to be mounted. They each wait for all unmounting apps to finish up
		 * before unmounting.
		 */
		const mountPromises = getAppsToMount()
			.filter(appToMount => appsToLoad.indexOf(appToMount) < 0)
			.map(async function(appToMount) {
				await toBootstrapPromise(appToMount);
				await unmountAllPromise;
				return toMountPromise(appToMount);
			})
		if (mountPromises.length > 0) {
			wasNoOp = false;
		}

		try {
			await Promise.all(unmountPromises);
		} catch(err) {
			callCapturedEventListeners(eventArguments);
			throw err;
		}

		/* Now that the apps that needed to be unmounted are unmounted, their DOM navigation
		 * events (like hashchange or popstate) should have been cleaned up. So it's safe
		 * to let the remaining captured event listeners to handle about the DOM event.
		 */
		callCapturedEventListeners(eventArguments);

		try {
			await Promise.all(loadThenMountPromises.concat(mountPromises));
		} catch(err) {
			pendingPromises.forEach(promise => promise.reject(err));
			throw err;
		}

		return finishUpAndReturn();
	}

	function finishUpAndReturn() {
		const returnValue = getMountedApps();

		pendingPromises.forEach(promise => promise.resolve(returnValue));

		/* Setting this allows for subsequent calls to reroute() to actually do perform
		 * a reroute instead of just getting queued behind the current reroute call.
		 * We want to do this after the mounting/unmounting is done but before we
		 * return from this async function.
		 */
		appChangeUnderway = false;

		if (peopleWaitingOnAppChange.length > 0) {
			/* While we were rerouting, someone else triggered another reroute that got queued.
			 * So we need reroute again.
			 */
			const nextPendingPromises = peopleWaitingOnAppChange;
			peopleWaitingOnAppChange = [];
			reroute(nextPendingPromises);
		} else {
			if (!wasNoOp) {
				window.dispatchEvent(new CustomEvent("single-spa:app-change"));
			}

			window.dispatchEvent(new CustomEvent("single-spa:routing-event"));
		}

		return returnValue;
	}
}
