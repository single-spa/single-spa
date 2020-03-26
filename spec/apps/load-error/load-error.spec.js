import * as singleSpa from "single-spa";

describe(`load-error`, () => {
  it(`will mount an application before loading another application finishes`, async () => {
    singleSpa.registerApplication(
      "load-error",
      () => Promise.reject(Error(`load failed`)),
      (location) => location.hash.startsWith("#load-error")
    );
    location.hash = "#load-error";
    await singleSpa.triggerAppChange();
    expect(singleSpa.getAppStatus("load-error")).toBe(singleSpa.LOAD_ERROR);
  });

  it(`puts app into LOAD_ERROR status before firing error event`, async () => {
    let numErrs = 0;

    await singleSpa.triggerAppChange();
    singleSpa.addErrorHandler(handleError);

    singleSpa.registerApplication(
      "load-error-2",
      () => Promise.reject(Error(`load failed`)),
      (location) => location.hash.startsWith("#load-error-2")
    );
    location.hash = "#load-error-2";
    await singleSpa.triggerAppChange();
    singleSpa.removeErrorHandler(handleError);
    expect(numErrs).toBe(1);

    function handleError(evt) {
      numErrs++;
      const appName = evt.appOrParcelName;
      expect(singleSpa.getAppStatus(appName)).toBe(singleSpa.LOAD_ERROR);
    }
  });
});
