const window = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : self);

export function handleChildAppError(message, childApp) {
	//detect if running in browser, where it's safer to throw lots of uncaught exceptions
	if (window.SINGLE_SPA_TESTING) {
		console.log(`---------------`)
		console.error(createMessage(childApp, message));
		console.error((new SingleSpaChildAppError(message, childApp)).stack);
		console.log(`---------------`)
	} else {
		//The set timeout ensures that single-spa doesn't die with this erro
		setTimeout(() => {
			throw new SingleSpaChildAppError(message, childApp);
		});
	}
}

function SingleSpaChildAppError(obj, childApp) {
	this.name = 'SingleSpaChildAppError';
	if (obj instanceof Error) {
		this.message = createMessage(childApp, obj.message);
		this.stack = obj.stack;
	} else {
		const err = new Error(obj || 'An error has occurred within a ChildApp of single-spa');
		this.message = createMessage(childApp, err.message);
		this.stack = err.stack;
	}
}

function createMessage(childApp, message) {
	return `App '${childApp.appLocation}' is misbehaving -- ${message}`;
}

SingleSpaChildAppError.prototype = Object.create(Error.prototype);
SingleSpaChildAppError.prototype.constructor = SingleSpaChildAppError;
