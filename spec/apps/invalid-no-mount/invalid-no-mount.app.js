export let isBootstrapped = false;

export function bootstrap() {
	return new Promise(resolve => {
		isBootstrapped = true;
		resolve();
	});
}

export function unmount() {
	return new Promise(resolve => resolve());
}
