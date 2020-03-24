import * as singleSpa from "single-spa";

describe(`bootstrap-times-out`, () => {
  let myApp,
    errs = [];

  function handleError(err) {
    errs.push(err);
  }

  beforeAll(() => {
    singleSpa.registerApplication(
      "./bootstrap-times-out.app.js",
      () => import("./bootstrap-times-out.app.js"),
      (location) => location.hash === "#bootstrap-times-out"
    );
    singleSpa.start();
  });

  beforeEach(() => {
    location.hash = "#";

    errs = [];
    singleSpa.addErrorHandler(handleError);

    return import("./bootstrap-times-out.app.js")
      .then((app) => (myApp = app))
      .then((app) => app.reset());
  });

  afterEach(() => {
    singleSpa.removeErrorHandler(handleError);
  });

  it(`is just waited for if dieOnTimeout is false`, () => {
    location.hash = "#bootstrap-times-out";

    return singleSpa.triggerAppChange().then(() => {
      expect(myApp.wasBootstrapped()).toEqual(true);
      expect(myApp.wasMounted()).toEqual(true);
      expect(singleSpa.getMountedApps()).toEqual([
        "./bootstrap-times-out.app.js",
      ]);
      expect(singleSpa.getAppStatus("./bootstrap-times-out.app.js")).toEqual(
        singleSpa.MOUNTED
      );
      expect(errs.length).toBe(0);
    });
  });
});
