export function handleChildAppError(err, childApp) {
	const transformedErr = transformErr(err, childApp);

	if (window.SINGLE_SPA_TESTING) {
		console.error(transformedErr);
	} else {
		setTimeout(() => {
			throw transformedErr;
		});
	}
}

function transformErr(ogErr, childApp) {
	const errPrefix = `'${childApp.appLocation}' died in status ${childApp.status}: `;

	let result;

	if (ogErr instanceof Error) {
		ogErr.message = errPrefix + ogErr.message;
		result = ogErr;
	} else {
		console.warn(`While ${childApp.status}, '${childApp.appLocation}' rejected its lifecycle function promise with a non-Error. This will cause stack traces to not be accurate.`);
		try {
			result = new Error(JSON.stringify(ogErr));
		} catch(err) {
			// If it's not an Error and you can't stringify it, then what else can you even do to it?
			result = ogErr;
		}
	}

	return result;
}
