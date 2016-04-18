export let numBootstraps = 0;
export let numMounts = 0;
export let numUnmounts = 0;

export const timeouts = {
	unmount: {
		dieOnTimeout: false,
		millis: 20,
	},
};

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
	return new Promise(resolve => {
		numUnmounts++;
		setTimeout(resolve, 40);
	});
}

export function reset() {
	numBootstraps = numMounts = numUnmounts = 0;
}
