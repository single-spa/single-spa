export let isMounted = false;

export function mount() {
	return new Promise(resolve => {
		isMounted = true;
	});
}

export function unmount() {
	return new Promise(resolve => {
		isMounted = false;
	});
}
