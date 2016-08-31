let bootstrapCalled, mountCalled, unmountCalled;

export function bootstrap() {
	return new Promise(resolve => {
		bootstrapCalled = true;
		resolve();
	});
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

export function bootstrapWasCalled() {
	return bootstrapCalled;
}

export function mountWasCalled() {
	return mountCalled;
}

export function unmountWasCalled() {
	return unmountCalled;
}

export function reset() {
	mountCalled = false;
	unmountCalled = false;
}
