export let wasBootstrapped = false;
export let wasMounted = false;

export function bootstrap() {
	return new Promise((resolve, reject) => {
		wasBootstrapped = true;
		reject('the bootstrap-rejects app failed to bootstrap');
	});
}

export function mount() {
	return new Promise(resolve => {
		wasMounted = true;
		resolve();
	});
}

export function unmount() {
	return new Promise(resolve => {
		resolve();
	});
}
