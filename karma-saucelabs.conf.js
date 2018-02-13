var commonConfig = require('./karma.conf.js');

var customLaunchers = {
  sl_chrome: {
    base: 'SauceLabs',
    browserName: 'chrome',
    platform: 'Windows 7',
    version: 'latest',
  },
  sl_firefox: {
    base: 'SauceLabs',
    browserName: 'firefox',
    version: 'latest',
  },
  sl_ie_11: {
    base: 'SauceLabs',
    browserName: 'internet explorer',
    platform: 'Windows 8.1',
    version: '11',
  },
  sl_ios_safari_9: {
    base: 'SauceLabs',
    browserName: 'safari',
    platform: 'OS X 10.11',
    version: '9.0',
  },
  sl_ios_safari_10: {
    base: 'SauceLabs',
    browserName: 'safari',
    platform: 'OS X 10.11',
    version: '10.0',
  },
  sl_edge: {
    base: 'SauceLabs',
    browserName: 'microsoftedge',
    platform: 'Windows 10',
    version: 'latest',
  },
};


module.exports = function(config) {
  commonConfig(config);

  config.set({
    sauceLabs: {
      testName: "single-spa tests",
      tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER,
      // username: 'joeldenning',
      // accessKey: 'access-key'
    },

    customLaunchers: customLaunchers,

    singleRun: true,

    reporters: ['progress', 'dots', 'saucelabs'],

    browsers: Object.keys(customLaunchers),
  });
}
