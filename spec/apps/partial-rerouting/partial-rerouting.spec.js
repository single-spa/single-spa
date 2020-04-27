import * as singleSpa from "single-spa";

describe("partial rerouting", () => {
  function delay() {
    return new Promise((resolve) => setImmediate(resolve));
  }

  beforeAll(() => singleSpa.start());

  beforeEach(() => {
    location.hash = "#";
  });

  it("shouldn't bootstrap and mount app if the route has been changed while app was loading, but if the user navigates back it should be bootstrapped and mounted successfully", async () => {
    const activeHash = "#partial-rerouting";

    let bootstrapped = false;
    let mounted = false;
    let unmounted = false;

    const app = {
      async bootstrap() {
        bootstrapped = true;
      },
      async mount() {
        mounted = true;
      },
      async unmount() {
        unmounted = true;
      },
    };

    singleSpa.registerApplication(
      "partial-rerouting",
      () => delay().then(() => app),
      (location) => location.hash === activeHash
    );

    location.hash = activeHash;

    const promise = singleSpa.triggerAppChange();

    singleSpa.navigateToUrl("#another-url");
    await Promise.all([singleSpa.triggerAppChange(), promise]);

    expect(bootstrapped).toBeFalsy();
    expect(mounted).toBeFalsy();
    expect(unmounted).toBeFalsy();

    singleSpa.navigateToUrl(activeHash);
    await singleSpa.triggerAppChange();

    expect(bootstrapped).toBeTruthy();
    expect(mounted).toBeTruthy();

    singleSpa.navigateToUrl("#another-url");
    await singleSpa.triggerAppChange();

    expect(unmounted).toBeTruthy();
  });

  it("should bootstrap and mount second app succcessfully, but should skip bootstrapping and mounting first app if the route has been changed", async () => {
    let firstAppBootstrapped = false,
      firstAppMounted = false,
      firstAppUnmounted = false;

    const firstApp = {
      async bootstrap() {
        firstAppBootstrapped = true;
      },
      async mount() {
        firstAppMounted = true;
      },
      async unmount() {
        firstAppUnmounted = true;
      },
    };

    let secondAppBootstrapped = false,
      secondAppMounted = false,
      secondAppUnmounted = false;

    const secondApp = {
      async bootstrap() {
        secondAppBootstrapped = true;
      },
      async mount() {
        secondAppMounted = true;
      },
      async unmount() {
        secondAppUnmounted = true;
      },
    };

    const firstAppActiveHash = "#first-app";
    const secondAppActiveHash = "#second-app";

    singleSpa.registerApplication(
      "first-app",
      () => delay().then(() => firstApp),
      (location) => location.hash === firstAppActiveHash
    );

    singleSpa.registerApplication(
      "second-app",
      () => Promise.resolve(secondApp),
      (location) => location.hash === secondAppActiveHash
    );

    location.hash = firstAppActiveHash;

    const promise = singleSpa.triggerAppChange();

    singleSpa.navigateToUrl(secondAppActiveHash);
    await Promise.all([singleSpa.triggerAppChange(), promise]);

    expect(firstAppBootstrapped).toBeFalsy();
    expect(secondAppBootstrapped).toBeTruthy();
    expect(secondAppMounted).toBeTruthy();
    expect(secondAppUnmounted).toBeFalsy();

    singleSpa.navigateToUrl(firstAppActiveHash);
    await singleSpa.triggerAppChange();

    expect(secondAppUnmounted).toBeTruthy();
    expect(firstAppBootstrapped).toBeTruthy();
    expect(firstAppMounted).toBeTruthy();
  });
});
