import * as singleSpa from "single-spa";

describe(`happy-active-when`, () => {
  let myApp;

  beforeAll(() => {
    singleSpa.registerApplication({
      name: "myApp",
      app: () => import("./happy-active-when.app.js"),
      activeWhen: [
        "/#/appWithRegularPrefix",
        "/pathname",
        (location) => location.pathname === "/specificCriteria",
        "/#/hashResource/:id/hashSubResource/:hashSubResourceId",
        "/resource/:id/subresource/:subId",
      ],
    });
  });

  beforeEach(() => {
    return import("./happy-active-when.app.js")
      .then((app) => (myApp = app))
      .then((app) => app.reset());
  });

  it(`goes through the whole lifecycle successfully on multiple activeWhen conditions`, async () => {
    singleSpa.start();
    expect(myApp.isMounted()).toEqual(false);
    expect(singleSpa.getMountedApps()).toEqual([]);

    const validPaths = [
      "/pathname",
      "/pathname/",
      "/#/appWithRegularPrefix",
      "/#/appWithRegularPrefix/",
      "/specificCriteria",
      "/resource/1/subresource/1",
      "/resource/1/subresource/1/",
      "/#/hashResource/1/hashSubResource/1",
      "/#/hashResource/1/hashSubResource/1/",
    ];

    validPaths.forEach(async (validPath) => {
      singleSpa.navigateToUrl(validPath + "anything/everything");
      await singleSpa.triggerAppChange();
      expectMyAppToBeMounted();

      singleSpa.navigateToUrl("/#/unregisteredPath");
      await singleSpa.triggerAppChange();
      expectMyAppToBeUnMmounted();
    });
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
});
