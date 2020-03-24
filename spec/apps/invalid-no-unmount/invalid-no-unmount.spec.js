import * as singleSpa from "single-spa";

const activeHash = `#invalid-no-unmount`;

describe(`invalid-no-unmount app`, () => {
  let myApp,
    errs = [];

  function handleError(err) {
    errs.push(err);
  }

  beforeAll(() => {
    singleSpa.registerApplication(
      "./invalid-no-unmount.app.js",
      () => import("./invalid-no-unmount.app.js"),
      (location) => location.hash === activeHash
    );
    singleSpa.start();
  });

  beforeEach(() => {
    location.hash = activeHash;

    errs = [];
    singleSpa.addErrorHandler(handleError);

    return import("./invalid-no-unmount.app.js")
      .then((app) => (myApp = app))
      .then((app) => app.reset());
  });

  afterEach(() => singleSpa.removeErrorHandler(handleError));

  it(`is never bootstrapped`, () => {
    return singleSpa.triggerAppChange().then(() => {
      expect(myApp.isBootstrapped()).toEqual(false);
      expect(myApp.isMounted()).toEqual(false);
      expect(singleSpa.getMountedApps()).toEqual([]);
      expect(singleSpa.getAppStatus("./invalid-no-unmount.app.js")).toEqual(
        "SKIP_BECAUSE_BROKEN"
      );
    });
  });
});
