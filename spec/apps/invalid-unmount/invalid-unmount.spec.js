import * as singleSpa from "single-spa";

const activeHash = `#invalid-unmount`;

describe(`invalid-unmount app`, () => {
  let myApp, errs;

  function handleError(err) {
    errs.push(err);
  }

  beforeAll(() => {
    singleSpa.registerApplication(
      "./invalid-unmount.app.js",
      () => import("./invalid-unmount.app.js"),
      (location) => location.hash === activeHash
    );
    singleSpa.start();
  });

  beforeEach(() => {
    location.hash = "#";

    errs = [];
    singleSpa.addErrorHandler(handleError);

    return import("./invalid-unmount.app.js")
      .then((app) => (myApp = app))
      .then((app) => app.reset());
  });

  function handleError(err) {
    errs.push(err);
  }

  it(`is bootstrapped, mounted, and unmounted, but then put in a broken state and never again mounted`, () => {
    location.hash = activeHash;

    return singleSpa.triggerAppChange().then(() => {
      expect(myApp.numBootstraps()).toEqual(1);
      expect(myApp.numMounts()).toEqual(1);
      expect(singleSpa.getMountedApps()).toEqual(["./invalid-unmount.app.js"]);
      expect(singleSpa.getAppStatus("./invalid-unmount.app.js")).toEqual(
        "MOUNTED"
      );

      // now unmount, which will be the first time it enters a broken state
      location.hash = "#not-invalid-unmount";
      return singleSpa.triggerAppChange().then(() => {
        expect(myApp.numBootstraps()).toEqual(1);
        expect(myApp.numMounts()).toEqual(1);
        expect(myApp.numUnmounts()).toEqual(1);
        expect(singleSpa.getMountedApps()).toEqual([]);
        expect(singleSpa.getAppStatus("./invalid-unmount.app.js")).toEqual(
          "SKIP_BECAUSE_BROKEN"
        );

        // now remount and check if it tries to mount despite being in a broken state
        location.hash = activeHash;
        return singleSpa.triggerAppChange().then(() => {
          expect(myApp.numBootstraps()).toEqual(1);
          expect(myApp.numMounts()).toEqual(1); // hasn't increased
          expect(myApp.numUnmounts()).toEqual(1);
          expect(singleSpa.getMountedApps()).toEqual([]);
          expect(singleSpa.getAppStatus("./invalid-unmount.app.js")).toEqual(
            "SKIP_BECAUSE_BROKEN"
          );
        });
      });
    });
  });
});
