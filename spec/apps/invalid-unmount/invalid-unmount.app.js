export let bootstrapCalled = 0;
export let mountCalled = 0;
export let unmountCalled = 0;

export function bootstrap() {
	return new Promise(resolve => {
		bootstrapCalled++;
		resolve();
	});
}

export function mount() {
	return new Promise(resolve => {
		mountCalled++;
		resolve();
	});
}

export function unmount() {
	unmountCalled++;
	// doesn't return a promise
}
