import * as singleSpa from "single-spa";

describe(`happy-basic`, () => {
  let myApp;

  beforeAll(() => {
    singleSpa.registerApplication(
      "./happy-basic.app.ts",
      () => import("./happy-basic.app.ts"),
      (location) => location.hash === "#happy-basic"
    );
    singleSpa.start();
  });

  beforeEach(() => {
    location.hash = "#";

    return import("./happy-basic.app.ts")
      .then((app) => (myApp = app))
      .then((app) => app.reset());
  });

  it(`goes through the whole lifecycle successfully`, () => {
    expect(myApp.isMounted()).toEqual(false);
    expect(singleSpa.getMountedApps()).toEqual([]);

    location.hash = "happy-basic";

    return singleSpa.triggerAppChange().then(() => {
      expect(myApp.wasBootstrapped()).toEqual(true);
      expect(myApp.isMounted()).toEqual(true);
      expect(singleSpa.getMountedApps()).toEqual(["./happy-basic.app.ts"]);

      location.hash = "#not-happy-basic";

      return singleSpa.triggerAppChange().then(() => {
        expect(myApp.wasBootstrapped()).toEqual(true);
        expect(myApp.isMounted()).toEqual(false);
        expect(singleSpa.getMountedApps()).toEqual([]);
      });
    });
  });
});
