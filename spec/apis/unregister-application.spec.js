import * as singleSpa from "single-spa";

describe("unregisterApplication", function () {
  let app;
  beforeEach(() => {
    app = {
      mount() {
        return Promise.resolve();
      },
      unmount() {
        return Promise.resolve();
      },
      bootstrap() {
        return Promise.resolve();
      },
    };
  });

  it(`should throw an error if no such application exists`, () => {
    expect(() => {
      window.__SINGLE_SPA_DEVTOOLS__.exposedMethods.unregisterApplication(
        `app that doesn't exist`
      );
    }).toThrow();
  });

  it(`should remove the application so it can be re-registered`, () => {
    singleSpa.registerApplication("about to unregister", app, () => false);
    expect(singleSpa.getAppStatus("about to unregister")).toBeTruthy();
    expect(() => {
      singleSpa.registerApplication("about to unregister", app, () => false);
    }).toThrow();

    return window.__SINGLE_SPA_DEVTOOLS__.exposedMethods
      .unregisterApplication("about to unregister")
      .then(() => {
        expect(singleSpa.getAppStatus("about to unregister")).toBeFalsy();
      });
  });
});
