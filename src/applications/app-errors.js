import CustomEvent from 'custom-event';

export function handleAppError(err, app) {
	const transformedErr = transformErr(err, app);

	window.dispatchEvent(new CustomEvent("single-spa:application-broken", {detail: {appName: app.name, err: transformedErr}}));

	if (window.SINGLE_SPA_TESTING) {
		console.error(transformedErr);
	} else {
		setTimeout(() => {
			throw transformedErr;
		});
	}
}

function transformErr(ogErr, app) {
	const errPrefix = `'${app.name}' died in status ${app.status}: `;

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
		console.warn(`While ${app.status}, '${app.name}' rejected its lifecycle function promise with a non-Error. This will cause stack traces to not be accurate.`);
		try {
			result = new Error(errPrefix + JSON.stringify(ogErr));
		} catch(err) {
			// If it's not an Error and you can't stringify it, then what else can you even do to it?
			result = ogErr;
		}
	}

	return result;
}
