import * as singleSpa from "single-spa";

const activeHash = `#invalid-no-mount`;

describe(`invalid-no-mount app`, () => {
  let myApp,
    errs = [];

  function handleError(err) {
    errs.push(err);
  }

  beforeAll(() => {
    singleSpa.registerApplication(
      "./invalid-no-mount.app.js",
      import("./invalid-no-mount.app.js"),
      (location) => location.hash === activeHash
    );
    singleSpa.start();
  });

  beforeEach(() => {
    location.hash = activeHash;

    singleSpa.addErrorHandler(handleError);

    return import("./invalid-no-mount.app.js")
      .then((app) => (myApp = app))
      .then((app) => app.reset());
  });

  afterEach(() => singleSpa.removeErrorHandler(handleError));

  it(`is never bootstrapped`, () => {
    return singleSpa.triggerAppChange().then(() => {
      expect(myApp.isBootstrapped()).toEqual(false);
      expect(singleSpa.getMountedApps()).toEqual([]);
      expect(singleSpa.getAppStatus("./invalid-no-mount.app.js")).toEqual(
        "SKIP_BECAUSE_BROKEN"
      );
    });
  });
});
