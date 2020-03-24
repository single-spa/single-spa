import * as singleSpa from "single-spa";

const activeHash = `#unmount-times-out`;

describe(`unmount-times-out app`, () => {
  let myApp, ogJasmineTimeout, errs;

  function handleError(err) {
    errs.push(err);
  }

  beforeAll(() => {
    singleSpa.registerApplication(
      "./unmount-times-out.app.js",
      () => import("./unmount-times-out.app.js"),
      (location) => location.hash === activeHash
    );
    singleSpa.start();
  });

  beforeEach(() => {
    errs = [];
    singleSpa.addErrorHandler(handleError);

    /* See http://jasmine.github.io/2.1/introduction.html#section-Asynchronous_Support.
     * Sometimes saucelabs is so slow on this test that jasmine times out
     */
    ogJasmineTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

    location.hash = "#";

    return import("./unmount-times-out.app.js")
      .then((app) => (myApp = app))
      .then((app) => app.reset());
  });

  afterEach(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = ogJasmineTimeout;
  });

  afterEach(() => singleSpa.removeErrorHandler(handleError));

  it(`is just waited for if dieOnTimeout is false`, () => {
    location.hash = activeHash;

    return singleSpa.triggerAppChange().then(() => {
      expect(myApp.numBootstraps()).toEqual(1);
      expect(myApp.numMounts()).toEqual(1);
      expect(singleSpa.getMountedApps()).toEqual([
        "./unmount-times-out.app.js",
      ]);
      expect(singleSpa.getAppStatus("./unmount-times-out.app.js")).toEqual(
        "MOUNTED"
      );

      location.hash = "#not-unmount-times-out";

      return singleSpa.triggerAppChange().then(() => {
        expect(myApp.numUnmounts()).toEqual(1);
        expect(singleSpa.getMountedApps()).toEqual([]);
        expect(singleSpa.getAppStatus("./unmount-times-out.app.js")).toEqual(
          "NOT_MOUNTED"
        );
      });
    });
  });
});
