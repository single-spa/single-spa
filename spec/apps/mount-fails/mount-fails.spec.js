import * as singleSpa from "single-spa";

const activeHash = `#mount-fails`;

describe(`mount-fails app`, () => {
  let myApp, errs;

  function handleError(err) {
    errs.push(err);
  }

  beforeAll(() => {
    singleSpa.registerApplication(
      "./mount-fails.app.js",
      () => import("./mount-fails.app.js"),
      (location) => location.hash === activeHash
    );
    singleSpa.start();
  });

  beforeEach(() => {
    location.hash = `#`;

    errs = [];
    singleSpa.addErrorHandler(handleError);

    return import("./mount-fails.app.js")
      .then((app) => (myApp = app))
      .then((app) => app.reset());
  });

  afterEach(() => singleSpa.removeErrorHandler(handleError));

  it(`bootstraps and mounts, but then is put into SKIP_BECAUSE_BROKEN and unmounts as a last effort`, () => {
    location.hash = activeHash;

    return singleSpa.triggerAppChange().then(() => {
      expect(myApp.wasBootstrapped()).toEqual(true);
      expect(myApp.wasMounted()).toEqual(true);
      expect(myApp.wasUnmounted()).toEqual(true); // We try to unmount an application if it fails to mount.
      expect(singleSpa.getMountedApps()).toEqual([]);
      expect(singleSpa.getAppStatus("./mount-fails.app.js")).toEqual(
        "SKIP_BECAUSE_BROKEN"
      );

      location.hash = "#not-mount-fails";
      return singleSpa.triggerAppChange().then(() => {
        expect(myApp.wasUnmounted()).toEqual(true);
        expect(singleSpa.getMountedApps()).toEqual([]);
        expect(singleSpa.getAppStatus("./mount-fails.app.js")).toEqual(
          "SKIP_BECAUSE_BROKEN"
        );
      });
    });
  });
});
