export let wasBootstrapped = false;
export let wasMounted = false;
export let wasUnmounted = false;

export function bootstrap() {
	return new Promise(resolve => {
		wasBootstrapped = true;
		resolve();
	});
}

export function mount() {
	wasMounted = true;
	// doesn't return a promise.
}

export function unmount() {
	return new Promise(resolve => {
		wasUnmounted = true;
	});
}
