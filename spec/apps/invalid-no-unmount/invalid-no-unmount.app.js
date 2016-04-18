export let isBootstrapped = false;
export let isMounted = false;

export function bootstrap() {
	return new Promise(resolve => {
		isBootstrapped = true;
		resolve();
	});
}

export function mount() {
	return new Promise(resolve => {
		isMounted = true;
		resolve();
	});
}
