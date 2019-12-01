import * as singleSpa from "single-spa";

describe(`app-names`, () => {
  beforeAll(() => {
    const app = {
      bootstrap() {
        return Promise.resolve();
      },
      mount() {
        return Promise.resolve();
      },
      unmount() {
        return Promise.resolve();
      }
    };
    singleSpa.registerApplication(
      "./app-names.app.js",
      app,
      location => location.hash === "#app-names"
    );
    singleSpa.start();
  });

  it(`should return all registered app names up to this point regardless of activity`, () => {
    expect(singleSpa.getAppNames()).toEqual(["./app-names.app.js"]);
  });
});
