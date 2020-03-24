import * as singleSpa from "single-spa";

const activeHash = `#unmount-times-out-dies`;

describe(`unmount-times-out-dies app`, () => {
  let myApp, errs;

  function handleError(err) {
    errs.push(err);
  }

  beforeAll(() => {
    singleSpa.registerApplication(
      "./unmount-times-out-dies.app.js",
      () => import("./unmount-times-out-dies.app.js"),
      (location) => location.hash === activeHash
    );
    singleSpa.start();
  });

  beforeEach(() => {
    location.hash = "#";

    errs = [];
    singleSpa.addErrorHandler(handleError);

    return import("./unmount-times-out-dies.app.js")
      .then((app) => (myApp = app))
      .then((app) => app.reset());
  });

  afterEach(() => singleSpa.removeErrorHandler(handleError));

  it(`is put into SKIP_BECAUSE_BROKEN when dieOnTimeout is true`, () => {
    location.hash = activeHash;

    return singleSpa.triggerAppChange().then(() => {
      expect(myApp.numBootstraps()).toEqual(1);
      expect(myApp.numMounts()).toEqual(1);
      expect(singleSpa.getMountedApps()).toEqual([
        "./unmount-times-out-dies.app.js",
      ]);
      expect(singleSpa.getAppStatus("./unmount-times-out-dies.app.js")).toEqual(
        "MOUNTED"
      );

      location.hash = "#not-unmount-times-out";

      return singleSpa.triggerAppChange().then(() => {
        expect(myApp.numUnmounts()).toEqual(1);
        expect(singleSpa.getMountedApps()).toEqual([]);
        expect(
          singleSpa.getAppStatus("./unmount-times-out-dies.app.js")
        ).toEqual("SKIP_BECAUSE_BROKEN");
      });
    });
  });
});
