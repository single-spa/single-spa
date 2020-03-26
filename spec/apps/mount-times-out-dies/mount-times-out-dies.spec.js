import * as singleSpa from "single-spa";

const activeHash = `#mount-times-out-dies`;

describe(`mount-times-out-dies app`, () => {
  let myApp, errs;

  function handleError(err) {
    errs.push(err);
  }

  beforeAll(() => {
    singleSpa.registerApplication(
      "./mount-times-out-dies.app.js",
      () => import("./mount-times-out-dies.app.js"),
      (location) => location.hash === activeHash
    );
    singleSpa.start();
  });

  beforeEach(() => {
    location.hash = "#";

    errs = [];
    singleSpa.addErrorHandler(handleError);

    return import("./mount-times-out-dies.app.js")
      .then((app) => (myApp = app))
      .then((app) => app.reset());
  });

  afterEach(() => singleSpa.removeErrorHandler(handleError));

  it(`is put into SKIP_BECAUSE_BROKEN if dieOnTimeout is true`, () => {
    location.hash = activeHash;

    return singleSpa.triggerAppChange().then(() => {
      expect(myApp.bootstraps()).toEqual(1);
      expect(myApp.mounts()).toEqual(1);
      expect(singleSpa.getMountedApps()).toEqual([]);
      expect(singleSpa.getAppStatus("./mount-times-out-dies.app.js")).toEqual(
        "SKIP_BECAUSE_BROKEN"
      );
    });
  });
});
