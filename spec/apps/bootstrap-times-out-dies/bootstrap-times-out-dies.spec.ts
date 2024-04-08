import * as singleSpa from "single-spa";

describe(`bootstrap-times-out-dies`, () => {
  let myApp,
    errs = [];

  function handleError(err) {
    errs.push(err);
  }

  beforeAll(() => {
    singleSpa.registerApplication(
      "./bootstrap-times-out-dies.app.ts",
      () => import("./bootstrap-times-out-dies.app.ts"),
      (location) => location.hash === "#bootstrap-times-out-dies"
    );
    singleSpa.start();
  });

  beforeEach(() => {
    location.hash = "#";

    errs = [];
    singleSpa.addErrorHandler(handleError);

    return import("./bootstrap-times-out-dies.app.ts")
      .then((app) => (myApp = app))
      .then((app) => app.reset());
  });

  afterEach(() => {
    singleSpa.removeErrorHandler(handleError);
  });

  it(`is put into SKIP_BECAUSE_BROKEN if dieOnTimeout is true`, () => {
    location.hash = "#bootstrap-times-out-dies";

    return singleSpa.triggerAppChange().then(() => {
      expect(myApp.wasBootstrapped()).toEqual(true);
      expect(myApp.wasMounted()).toEqual(false);
      expect(singleSpa.getMountedApps()).toEqual([]);
      expect(
        singleSpa.getAppStatus("./bootstrap-times-out-dies.app.ts")
      ).toEqual("SKIP_BECAUSE_BROKEN");
      expect(errs.length).toBeGreaterThan(0);
    });
  });
});
