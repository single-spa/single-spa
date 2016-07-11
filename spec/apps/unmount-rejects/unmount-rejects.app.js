export let numBootstraps = 0;
export let numMounts = 0;
export let numUnmounts = 0;

export function bootstrap() {
	return new Promise(resolve => {
		numBootstraps++;
		resolve();
	});
}

export function mount() {
	return new Promise(resolve => {
		numMounts++;
		resolve();
	});
}

export function unmount() {
	return new Promise((resolve, reject) => {
		numUnmounts++;
		reject();
	});
}
