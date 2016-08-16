export let Loader = null;

export function setLoader(loader) {
	if (!loader || typeof loader.import !== 'function') {
		throw new Error(`'loader' is not a real loader. Must have an import function that returns a Promise`);
	}
	Loader = loader;
}
