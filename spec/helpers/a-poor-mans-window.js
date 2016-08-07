Object.assign(global, {
	location: '',
	addEventListener: () => {},
	history: {
		pushState: () => {},
	},
	SINGLE_SPA_TESTING: true,
	document: {
	},
});
