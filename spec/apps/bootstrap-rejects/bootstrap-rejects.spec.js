import * as singleSpa from "single-spa";

describe(`bootstrap-rejects`, () => {
  let myApp,
    errs = [];

  function handleError(err) {
    errs.push(err);
  }

  beforeAll(() => {
    singleSpa.registerApplication(
      "./bootstrap-rejects.app.js",
      () => import("./bootstrap-rejects.app.js"),
      (location) => location.hash === "#bootstrap-rejects"
    );
    singleSpa.start();
  });

  beforeEach(() => {
    errs = [];
    singleSpa.addErrorHandler(handleError);

    return import("./bootstrap-rejects.app.js")
      .then((app) => (myApp = app))
      .then((app) => app.reset());
  });

  afterEach(() => {
    singleSpa.removeErrorHandler(handleError);
  });

  it(`puts the app into SKIP_BECAUSE_BROKEN, fires a window event, and doesn't mount it`, () => {
    location.hash = "#bootstrap-rejects";

    return singleSpa.triggerAppChange().then(() => {
      expect(errs.length).toBe(1);
      expect(myApp.wasBootstrapped()).toEqual(true);
      expect(myApp.wasMounted()).toEqual(false);
      expect(singleSpa.getMountedApps()).toEqual([]);
      expect(singleSpa.getAppStatus("./bootstrap-rejects.app.js")).toEqual(
        singleSpa.SKIP_BECAUSE_BROKEN
      );
    });
  });
});
