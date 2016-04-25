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
	return new Promise(resolve => {
		wasMounted = true;
		reject(`mount-rejects app rejected the mount lifecycle`);
	});
}

export function unmount() {
	return new Promise(resolve => {
		wasUnmounted = true;
		resolve();
	});
}
