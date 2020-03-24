import * as singleSpa from "single-spa";

const activeHash = `#invalid-mount`;

describe(`invalid-mount app`, () => {
  let myApp, errs;

  function handleError(err) {
    errs.push(err);
  }

  beforeAll(() => {
    singleSpa.registerApplication(
      "./invalid-mount.app.js",
      () => import("./invalid-mount.app.js"),
      (location) => location.hash === activeHash
    );
    singleSpa.start();
  });

  beforeEach(() => {
    errs = [];
    singleSpa.addErrorHandler(handleError);

    return import("./invalid-mount.app.js")
      .then((app) => (myApp = app))
      .then((app) => app.reset());
  });

  afterEach(() => {
    singleSpa.removeErrorHandler(handleError);
  });

  it(`is bootstrapped and mounted, but then put in a broken state`, () => {
    location.hash = activeHash;

    return singleSpa.triggerAppChange().then(() => {
      expect(myApp.wasBootstrapped()).toEqual(true);
      expect(myApp.wasMounted()).toEqual(true);
      expect(singleSpa.getMountedApps()).toEqual([]);
      expect(singleSpa.getAppStatus("./invalid-mount.app.js")).toEqual(
        "SKIP_BECAUSE_BROKEN"
      );

      location.hash = "not-invalid-mount";

      return singleSpa.triggerAppChange().then(() => {
        expect(singleSpa.getMountedApps()).toEqual([]);
        expect(singleSpa.getAppStatus("./invalid-mount.app.js")).toEqual(
          "SKIP_BECAUSE_BROKEN"
        );
      });
    });
  });
});
