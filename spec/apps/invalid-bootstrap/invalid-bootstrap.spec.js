import * as singleSpa from "single-spa";

const activeHash = `#invalid-bootstrap`;

describe(`invalid-bootstrap app`, () => {
  let myApp,
    errs = [];

  function handleError(err) {
    errs.push(err);
  }

  beforeAll(() => {
    singleSpa.registerApplication(
      "./invalid-bootstrap.app.js",
      () => import("./invalid-bootstrap.app.js"),
      (location) => location.hash === activeHash
    );
    singleSpa.start();
  });

  beforeEach(() => {
    location.hash = activeHash;

    errs = [];
    singleSpa.addErrorHandler(handleError);

    return import("./invalid-bootstrap.app.js")
      .then((app) => (myApp = app))
      .then((app) => app.reset());
  });

  afterEach(() => {
    singleSpa.removeErrorHandler(handleError);
  });

  it(`is never bootstrapped, mounted, or unmounted`, () => {
    return singleSpa.triggerAppChange().then(() => {
      expect(myApp.mountWasCalled()).toEqual(false);
      expect(myApp.unmountWasCalled()).toEqual(false);
      expect(singleSpa.getMountedApps()).toEqual([]);
      expect(singleSpa.getAppStatus("./invalid-bootstrap.app.js")).toEqual(
        "SKIP_BECAUSE_BROKEN"
      );
      expect(errs.length).toBeGreaterThan(0);
    });
  });
});
