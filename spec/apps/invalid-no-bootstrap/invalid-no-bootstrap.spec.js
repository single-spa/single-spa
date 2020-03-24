import * as singleSpa from "single-spa";

const activeHash = `#invalid-no-bootstrap`;

describe(`invalid-no-bootstrap app`, () => {
  let myApp,
    errs = [];

  function handleError(err) {
    errs.push(err);
  }

  beforeAll(() => {
    singleSpa.registerApplication(
      "./invalid-no-bootstrap.app.js",
      () => import("./invalid-no-bootstrap.app.js"),
      (location) => location.hash === activeHash
    );
    singleSpa.start();
  });

  beforeEach(() => {
    location.hash = activeHash;

    errs = [];
    singleSpa.addErrorHandler(handleError);

    return import("./invalid-no-bootstrap.app.js")
      .then((app) => (myApp = app))
      .then((app) => app.reset());
  });

  afterEach(() => {
    singleSpa.removeErrorHandler(handleError);
  });

  it(`is never mounted`, () => {
    return singleSpa.triggerAppChange().then(() => {
      expect(myApp.isMounted()).toEqual(false);
      expect(singleSpa.getMountedApps()).toEqual([]);
      expect(singleSpa.getAppStatus("./invalid-no-bootstrap.app.js")).toEqual(
        "SKIP_BECAUSE_BROKEN"
      );
    });
  });
});
