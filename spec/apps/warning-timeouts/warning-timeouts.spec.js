import * as singleSpa from "single-spa";

const activeHash = `#warning-timeouts`;

describe(`warning-timeouts app`, () => {
  let errs, myApp, consoleWarnSpy;

  function handleError(err) {
    errs.push(err);
  }

  beforeAll(() => {
    singleSpa.registerApplication(
      "warning-timeouts",
      () => import("./warning-timeouts.app"),
      (location) => location.hash === activeHash
    );
    singleSpa.start();
    consoleWarnSpy = jest.spyOn(console, "warn");
    jest.useFakeTimers();
  });

  afterAll(() => {
    consoleWarnSpy.mockRestore();
    jest.useRealTimers();
  });

  beforeEach(() => {
    errs = [];
    singleSpa.addErrorHandler(handleError);

    location.hash = "#";

    return import("./warning-timeouts.app")
      .then((app) => (myApp = app))
      .then((app) => app.reset());
  });

  afterEach(() => {
    singleSpa.removeErrorHandler(handleError);
    return singleSpa.unloadApplication("warning-timeouts");
  });

  it(`doesn't warn if everything resolves before the default warning setting`, async () => {
    location.hash = activeHash;

    await controlledAppChange();
    expect(singleSpa.getAppStatus("warning-timeouts")).toEqual("MOUNTED");
    expect(errs.length).toBe(0);
    expect(consoleWarnSpy).not.toHaveBeenCalled();

    location.hash = "#not-warning-timeouts";

    await controlledAppChange();
    expect(singleSpa.getAppStatus("warning-timeouts")).toEqual("NOT_MOUNTED");
    expect(errs.length).toBe(0);
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it(`does warn if things don't resolve until after the default warning setting`, async () => {
    myApp.setDelay(3);
    location.hash = activeHash;

    await controlledAppChange();
    expect(singleSpa.getAppStatus("warning-timeouts")).toEqual("MOUNTED");
    expect(errs.length).toBe(0);
    expectWarning(
      `single-spa minified message #31: Lifecycle function bootstrap for application warning-timeouts lifecycle did not resolve or reject for 4000 ms. See https://single-spa.js.org/error/?code=31&arg=bootstrap&arg=application&arg=warning-timeouts&arg=4000`
    );
    expectWarning(
      `single-spa minified message #31: Lifecycle function mount for application warning-timeouts lifecycle did not resolve or reject for 3000 ms. See https://single-spa.js.org/error/?code=31&arg=mount&arg=application&arg=warning-timeouts&arg=3000`
    );

    location.hash = "#not-warning-timeouts";

    await controlledAppChange();
    expect(singleSpa.getAppStatus("warning-timeouts")).toEqual("NOT_MOUNTED");
    expect(errs.length).toBe(0);
  });

  function expectWarning(message) {
    expect(consoleWarnSpy).toHaveBeenCalled();
    const found = consoleWarnSpy.mock.calls.some((call) => call[0] === message);
    if (!found) {
      expect(consoleWarnSpy).toHaveBeenCalledWith(message);
    }
  }
});

async function controlledAppChange() {
  const appChangePromise = singleSpa.triggerAppChange();
  await flushPromises();
  jest.advanceTimersByTime(1);
  await flushPromises();
  jest.advanceTimersByTime(1);
  await flushPromises();
  jest.advanceTimersByTime(1);
  await flushPromises();
  jest.advanceTimersByTime(1);
  await flushPromises();
  jest.advanceTimersByTime(1);
  await flushPromises();
  jest.advanceTimersByTime(1);
  await flushPromises();
  jest.advanceTimersByTime(1);
  await flushPromises();
  await appChangePromise;
}

// https://github.com/facebook/jest/issues/2157#issuecomment-279171856
function flushPromises() {
  return new Promise((resolve) => setImmediate(resolve));
}
