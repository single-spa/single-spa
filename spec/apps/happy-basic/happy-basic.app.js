export let wasBootstrapped = false;
export let isMounted = false;

export function bootstrap() {
	return new Promise(resolve => {
		wasBootstrapped = true;
		resolve();
	});
}

export function mount() {
	return new Promise(resolve => {
		isMounted = true;
		resolve();
	});
}

export function unmount() {
	return new Promise(resolve => {
		isMounted = false;
		resolve()
	});
}
