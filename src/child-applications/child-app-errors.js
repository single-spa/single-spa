import CustomEvent from 'custom-event';

export function handleChildAppError(err, childApp) {
	const transformedErr = transformErr(err, childApp);

	window.dispatchEvent(new CustomEvent("single-spa:application-broken", {detail: {appName: childApp.name, err: transformedErr}}));

	if (window.SINGLE_SPA_TESTING) {
		console.error(transformedErr);
	} else {
		setTimeout(() => {
			throw transformedErr;
		});
	}
}

function transformErr(ogErr, childApp) {
	const errPrefix = `'${childApp.name}' died in status ${childApp.status}: `;

	let result;

	if (ogErr instanceof Error) {
		try {
			ogErr.message = errPrefix + ogErr.message;
		} catch(err) {
			/* Some errors have read-only message properties, in which case there is nothing
			 * that we can do.
			 */
		}
		result = ogErr;
	} else {
		console.warn(`While ${childApp.status}, '${childApp.name}' rejected its lifecycle function promise with a non-Error. This will cause stack traces to not be accurate.`);
		try {
			result = new Error(errPrefix + JSON.stringify(ogErr));
		} catch(err) {
			// If it's not an Error and you can't stringify it, then what else can you even do to it?
			result = ogErr;
		}
	}

	return result;
}
