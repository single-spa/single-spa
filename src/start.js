import { reroute } from './navigation/reroute.js';
import { setLoader } from './loader.js';

export let started = false;

export function start() {
	started = true;
	reroute();
}

export function isStarted() {
	return started;
}
