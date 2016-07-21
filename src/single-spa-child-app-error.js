const window = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : self);

export function handleChildAppError(err, childApp) {
	const transformedErr = transformErr(err, childApp);

	//detect if running in browser, where it's safer to throw lots of uncaught exceptions
	if (window.SINGLE_SPA_TESTING) {
		console.log(`---------------`)
		console.error(transformedErr);
		console.log(`---------------`)
	} else {
		// The setTimeout ensures that single-spa doesn't die when this error is thrown.
		setTimeout(() => {
			throw transformedErr;
		});
	}
}

function transformErr(ogErr, childApp) {
	const errPrefix = `'${childApp.appLocation}' died in status ${childApp.status}: `;

	let result;

	if (ogErr instanceof Error) {
		err.message = errPrefix + ogErr.message;
		result = ogErr;
	} else {
		console.warn(`While ${childApp.status}, '${childApp.appLocation}' rejected its lifecycle function promise with a non-Error. This will cause stack traces to not be accurate.`);
		try {
			result = new Error(JSON.stringify(ogErr));
		} catch(err) {
			result = ogErr;
		}
	}

	return result;
}
