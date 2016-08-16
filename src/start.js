import { reroute } from './navigation/reroute.js';
import { setLoader } from './loader.js';

export let started = false;

export function start(opts) {
	if (typeof opts !== "object" || !opts.loader) {
		throw new Error(`single-spa start() must be given an 'opts' object that has a 'loader' property`);
	}
	setLoader(opts.loader);
	started = true;
	reroute();
}

export function isStarted() {
	return started;
}
