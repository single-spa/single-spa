export let mountCalled = false;
export let unmountCalled = false;

export function bootstrap() {
	// doesn't return a promise
	return;
}

export function mount() {
	return new Promise(resolve => {
		mountCalled = true;
		resolve();
	});
}

export function unmount() {
	return new Promise(resolve => {
		unmountCalled = true;
		resolve();
	});
}
