import * as singleSpa from "single-spa";

const activeHash = "#mounting-status";

describe(`mounting-status`, () => {
  let app;

  beforeAll(async () => {
    singleSpa.registerApplication({
      name: "mounting-status",
      app: () => import("./mounting-status.app.js"),
      activeWhen: (location) => location.hash === activeHash,
    });
    singleSpa.start();

    app = await import("./mounting-status.app.js");
  });

  beforeEach(() => {
    location.hash = "#";
  });

  it(`puts application into MOUNTING status when it's mounting`, async () => {
    await singleSpa.triggerAppChange();

    let mountStartResolve,
      mountStartPromise = new Promise((r) => (mountStartResolve = r));
    app.getEventTarget().addEventListener("mount-start", mountStartResolve);

    expect(singleSpa.getAppStatus("mounting-status")).toEqual(
      singleSpa.NOT_LOADED
    );
    singleSpa.navigateToUrl(activeHash);
    const routingPromise = singleSpa.triggerAppChange();

    await mountStartPromise;
    expect(singleSpa.getAppStatus("mounting-status")).toEqual(
      singleSpa.MOUNTING
    );

    await routingPromise;
    expect(singleSpa.getAppStatus("mounting-status")).toEqual(
      singleSpa.MOUNTED
    );

    app.getEventTarget().removeEventListener("mount-start", mountStartResolve);
  });
});
