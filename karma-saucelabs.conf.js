var commonConfig = require('./karma.conf.js');

var customLaunchers = {
	sl_chrome: {
		base: 'SauceLabs',
		browserName: 'chrome',
		platform: 'Windows 7',
		version: '52',
	},
	sl_firefox: {
		base: 'SauceLabs',
		browserName: 'firefox',
		version: '45',
	},
	sl_ie_11: {
		base: 'SauceLabs',
		browserName: 'internet explorer',
		platform: 'Windows 8.1',
		version: '11',
	},
};


module.exports = function(config) {
	commonConfig(config);

	config.set({
		sauceLabs: {
			testName: "single-spa tests",
		},

		customLaunchers: customLaunchers,

		singleRun: true,

		reporters: ['progress', 'dots', 'saucelabs'],

		browsers: Object.keys(customLaunchers),
	});
}
