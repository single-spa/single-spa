import * as singleSpa from "single-spa";

describe(`happy-active-when`, () => {
  let myApp;
  const realLocation = global.location;

  beforeAll(() => {
    singleSpa.registerApplication({
      name: "myApp",
      app: () => import("./happy-active-when.app.js"),
      activeWhen: [
        "/#/appWithRegularPrefix",
        "/pathname",
        location => location.pathname === "/specificCriterea"
      ]
    });
  });

  beforeEach(() => {
    return import("./happy-active-when.app.js")
      .then(app => (myApp = app))
      .then(app => app.reset());
  });

  afterEach(() => {
    global.location = realLocation;
  });

  it(`goes through the whole lifecycle successfully on multiple activeWhen conditions`, async () => {
    singleSpa.start();
    expect(myApp.isMounted()).toEqual(false);
    expect(singleSpa.getMountedApps()).toEqual([]);
    newLocation("http://mock.com/pathname");
    await singleSpa.triggerAppChange();
    expectMyAppToBeMounted();
    newLocation("http://mock.com/#/unregisteredPath");
    await singleSpa.triggerAppChange();
    expectMyAppToBeUnMmounted();
    newLocation("http://mock.com/#/appWithRegularPrefix");
    await singleSpa.triggerAppChange();
    expectMyAppToBeMounted();
    newLocation("http://mock.com/#/unregisteredPath");
    await singleSpa.triggerAppChange();
    expectMyAppToBeUnMmounted();
    newLocation("http://mock.com/specificCriterea");
    await singleSpa.triggerAppChange();
    expectMyAppToBeMounted();
  });

  function expectMyAppToBeMounted() {
    expect(myApp.wasBootstrapped()).toEqual(true);
    expect(myApp.isMounted()).toEqual(true);
    expect(singleSpa.getMountedApps()).toEqual(["myApp"]);
  }

  function expectMyAppToBeUnMmounted() {
    expect(myApp.wasBootstrapped()).toEqual(true);
    expect(myApp.isMounted()).toEqual(false);
    expect(singleSpa.getMountedApps()).toEqual([]);
  }

  function newLocation(url) {
    delete global.location;
    global.location = new URL(url); // Can't change location by mutating global location. See https://github.com/jsdom/jsdom/issues/2112
  }
});
