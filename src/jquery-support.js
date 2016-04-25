let hasInitialized = false;

export function ensureJQuerySupport() {
	let jQuery = window.jQuery;
	if (!jQuery) {
		if (window.$ && window.$.fn && window.$.fn.jquery) {
			jQuery = window.$;
		}
	}

	if (jQuery && !hasInitialized) {
		const originalJQueryOn = jQuery.fn.on;
		const originalJQueryOff = jQuery.fn.off;

		jQuery.fn.on = function(eventString, fn) {
			if (typeof eventString !== 'string') {
				return originalJQueryOn.apply(this, arguments);
			}

			const eventNames = eventString.split(/\s+/);
			eventNames.forEach(eventName => {
				if (eventName === 'hashchange' || eventName === 'popstate') {
					window.addEventListener(eventName, fn);
					eventString = eventString.replace(eventName, '');
				}
			});

			if (eventString.trim() === '') {
				return this;
			} else {
				return originalJQueryOn.apply(this, arguments);
			}
		}

		jQuery.fn.off = function(eventString, fn) {
			if (typeof eventString !== 'string') {
				return originalJQueryOn.apply(this, arguments);
			}

			const eventNames = eventString.split(/\s+/);
			eventNames.forEach(eventName => {
				if (eventName === 'hashchange' || eventName === 'popstate') {
					window.removeEventListener(eventName, fn);
					eventString = eventString.replace(eventName, '');
				}
			});

			if (eventString.trim() === '') {
				return this;
			} else {
				return originalJQueryOff.apply(this, arguments);
			}
		}

		hasInitialized = true;
	}
}
