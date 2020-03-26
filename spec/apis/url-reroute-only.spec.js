import * as singleSpa from "single-spa";

describe(`urlRerouteOnly option`, () => {
  beforeAll(() => {
    singleSpa.start({
      urlRerouteOnly: true,
    });
  });

  it(`Doesn't trigger a reroute when the URL changes and urlRerouteOnly is set to true`, async () => {
    let activeWhenCalls = 0,
      popstateCalls = 0;
    const activeWhen = () => activeWhenCalls++;
    const popstateListener = () => popstateCalls++;
    const app = { async bootstrap() {}, async mount() {}, async unmount() {} };

    window.addEventListener("popstate", popstateListener);
    singleSpa.registerApplication("urlRerouteOnly test", app, activeWhen);

    await singleSpa.triggerAppChange();

    const numPopstatesBefore = popstateCalls;
    const numActiveWhensBefore = activeWhenCalls;
    history.replaceState({ some: "state" }, document.title);
    // calling triggerAppChange forcibly increments the counters which is weird for this test
    // but it also ensures we wait for the reroute to finish (if it's taking place)
    await singleSpa.triggerAppChange();

    expect(numPopstatesBefore).toBe(popstateCalls);
    // The 1 comes from triggerAppChange
    expect(numActiveWhensBefore).toBe(activeWhenCalls - 1);
  });
});
