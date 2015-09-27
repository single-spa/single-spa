// Karma configuration file
module.exports = function (karma) {

  var files = require('../files').files;

  karma.set({
    // base path, that will be used to resolve files and exclude
    basePath: '..',

    // list of files / patterns to load in the browser
    files: [].concat(files.angular('1.1.5'), files.testUtils, files.src, files.test),

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: karma.LOG_DEBUG,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari
    // - PhantomJS
    browsers: [ 'PhantomJS' ]
  })
};