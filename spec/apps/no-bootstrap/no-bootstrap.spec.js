import * as singleSpa from "single-spa";

const activeHash = "#no-bootstrap";

describe(`no-bootstrap app`, () => {
  let myApp;

  beforeAll(() => {
    singleSpa.registerApplication({
      name: "no-bootstrap",
      app: () => import("./no-bootstrap.app.js"),
      activeWhen: (location) => location.hash === activeHash,
    });
    singleSpa.start();
  });

  beforeEach(() => {
    location.hash = "#";
  });

  it(`allows an application to omit the bootstrap lifecycle`, async () => {
    expect(
      singleSpa.getMountedApps().some((app) => app === "no-bootstrap")
    ).toBe(false);

    location.hash = activeHash;

    await singleSpa.triggerAppChange();

    expect(
      singleSpa.getMountedApps().some((app) => app === "no-bootstrap")
    ).toBe(true);
  });
});
