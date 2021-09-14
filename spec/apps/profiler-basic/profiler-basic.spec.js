import * as singleSpa from "single-spa";
import {
  clearProfilerData,
  getProfilerData,
} from "../../../src/devtools/profiler.js";

describe(`profiler basics`, () => {
  let app,
    shouldMount = false,
    loadApp;

  beforeAll(() => {
    singleSpa.start();
  });

  beforeEach(() => {
    app = {
      bootstrap: jest.fn(() => Promise.resolve()),
      mount: jest.fn(() => Promise.resolve()),
      unmount: jest.fn(() => Promise.resolve()),
      unload: jest.fn(() => Promise.resolve()),
    };

    loadApp = jest.fn(() => Promise.resolve(app));

    singleSpa.registerApplication({
      name: "profiler-basics",
      app: loadApp,
      activeWhen: () => shouldMount,
    });
    shouldMount = false;
  });

  afterEach(async () => {
    shouldMount = false;
    await singleSpa.unloadApplication("profiler-basics", {
      waitForUnmount: false,
    });
    singleSpa.unregisterApplication("profiler-basics");
    await singleSpa.triggerAppChange();
    clearProfilerData();
  });

  it(`captures load profile events`, async () => {
    const loadProfilesBefore = getProfilerEventsByKind("load");
    expect(loadProfilesBefore.length).toBe(0);

    shouldMount = true;
    await singleSpa.triggerAppChange();
    expect(singleSpa.getAppStatus("profiler-basics")).toEqual(
      singleSpa.MOUNTED
    );
    const loadProfilesAfter = getProfilerEventsByKind("load");

    expect(loadProfilesAfter.length).toBe(1);
    expect(loadProfilesAfter[0].operationSucceeded).toBe(true);
    expect(!Number.isNaN(loadProfilesAfter[0].start)).toBe(true);
    expect(!Number.isNaN(loadProfilesAfter[0].end)).toBe(true);
  });

  it(`captures load error profile events`, async () => {
    loadApp.mockImplementationOnce(() =>
      Promise.reject(Error("Failed to load"))
    );

    const loadProfilesBefore = getProfilerEventsByKind("load");
    expect(loadProfilesBefore.length).toBe(0);

    shouldMount = true;
    await singleSpa.triggerAppChange();
    expect(singleSpa.getAppStatus("profiler-basics")).toEqual(
      singleSpa.LOAD_ERROR
    );
    const loadProfilesAfter = getProfilerEventsByKind("load");

    expect(loadProfilesAfter.length).toBe(1);
    expect(loadProfilesAfter[0].operationSucceeded).toBe(false);
  });

  it(`captures bootstrap profile events`, async () => {
    const profilesBefore = getProfilerEventsByKind("bootstrap");
    expect(profilesBefore.length).toBe(0);

    shouldMount = true;
    await singleSpa.triggerAppChange();
    expect(singleSpa.checkActivityFunctions()).toContain("profiler-basics");
    expect(singleSpa.getAppStatus("profiler-basics")).toEqual(
      singleSpa.MOUNTED
    );
    const profilesAfter = getProfilerEventsByKind("bootstrap");

    expect(profilesAfter.length).toBe(1);
    expect(profilesAfter[0].operationSucceeded).toBe(true);
  });

  it(`captures bootstrap error profile events`, async () => {
    app.bootstrap.mockImplementationOnce(() =>
      Promise.reject(Error("Bootstrap err"))
    );

    const profilesBefore = getProfilerEventsByKind("bootstrap");
    expect(profilesBefore.length).toBe(0);

    shouldMount = true;
    await singleSpa.triggerAppChange();
    expect(singleSpa.checkActivityFunctions()).toContain("profiler-basics");
    expect(singleSpa.getAppStatus("profiler-basics")).toEqual(
      singleSpa.SKIP_BECAUSE_BROKEN
    );
    const profilesAfter = getProfilerEventsByKind("bootstrap");

    expect(profilesAfter.length).toBe(1);
    expect(profilesAfter[0].operationSucceeded).toBe(false);
  });

  it(`captures mount profile events`, async () => {
    const profilesBefore = getProfilerEventsByKind("mount");
    expect(profilesBefore.length).toBe(0);

    shouldMount = true;
    await singleSpa.triggerAppChange();
    expect(singleSpa.checkActivityFunctions()).toContain("profiler-basics");
    expect(singleSpa.getAppStatus("profiler-basics")).toEqual(
      singleSpa.MOUNTED
    );
    const profilesAfter = getProfilerEventsByKind("mount");

    expect(profilesAfter.length).toBe(1);
    expect(profilesAfter[0].operationSucceeded).toBe(true);
  });

  it(`captures mount error profile events`, async () => {
    app.mount.mockImplementationOnce(() => Promise.reject(Error("Mount err")));

    const profilesBefore = getProfilerEventsByKind("mount");
    expect(profilesBefore.length).toBe(0);

    shouldMount = true;
    await singleSpa.triggerAppChange();
    expect(singleSpa.checkActivityFunctions()).toContain("profiler-basics");
    expect(singleSpa.getAppStatus("profiler-basics")).toEqual(
      singleSpa.SKIP_BECAUSE_BROKEN
    );
    const profilesAfter = getProfilerEventsByKind("mount");

    expect(profilesAfter.length).toBe(1);
    expect(profilesAfter[0].operationSucceeded).toBe(false);
  });

  it(`captures unmount profile events`, async () => {
    const profilesBefore = getProfilerEventsByKind("unmount");
    expect(profilesBefore.length).toBe(0);

    shouldMount = true;
    await singleSpa.triggerAppChange();
    shouldMount = false;
    await singleSpa.triggerAppChange();

    const profilesAfter = getProfilerEventsByKind("unmount");

    expect(profilesAfter.length).toBe(1);
    expect(profilesAfter[0].operationSucceeded).toBe(true);
  });

  it(`captures unmount error profile events`, async () => {
    app.unmount.mockImplementationOnce(() =>
      Promise.reject(Error("Mount errr"))
    );
    const profilesBefore = getProfilerEventsByKind("unmount");
    expect(profilesBefore.length).toBe(0);

    shouldMount = true;
    await singleSpa.triggerAppChange();
    shouldMount = false;
    await singleSpa.triggerAppChange();

    expect(singleSpa.getAppStatus("profiler-basics")).toBe(
      singleSpa.SKIP_BECAUSE_BROKEN
    );

    const profilesAfter = getProfilerEventsByKind("unmount");

    expect(profilesAfter.length).toBe(1);
    expect(profilesAfter[0].operationSucceeded).toBe(false);
  });

  it(`captures unload profile events`, async () => {
    const profilesBefore = getProfilerEventsByKind("unload");
    expect(profilesBefore.length).toBe(0);

    shouldMount = true;
    await singleSpa.triggerAppChange();
    shouldMount = false;
    await singleSpa.unloadApplication("profiler-basics", {
      waitForUnmount: false,
    });
    await singleSpa.triggerAppChange();
    await singleSpa.triggerAppChange();
    expect(singleSpa.getAppStatus("profiler-basics")).toEqual(
      singleSpa.NOT_LOADED
    );

    const profilesAfter = getProfilerEventsByKind("unload");

    expect(profilesAfter.length).toBe(1);
    expect(profilesAfter[0].operationSucceeded).toBe(true);
  });

  it(`captures unloadErr error profile events`, async () => {
    app.unload.mockImplementationOnce(() =>
      Promise.reject(Error("Unload errr"))
    );
    const profilesBefore = getProfilerEventsByKind("unload");
    expect(profilesBefore.length).toBe(0);

    shouldMount = true;
    await singleSpa.triggerAppChange();
    shouldMount = false;
    await singleSpa.triggerAppChange();
    clearProfilerData();
    try {
      await singleSpa.unloadApplication("profiler-basics", {
        waitForUnmount: false,
      });
      fail("Expected unload err");
    } catch (err) {}

    await singleSpa.triggerAppChange();

    expect(singleSpa.getAppStatus("profiler-basics")).toBe(
      singleSpa.SKIP_BECAUSE_BROKEN
    );

    const profilesAfter = getProfilerEventsByKind("unload");

    expect(profilesAfter.length).toBe(1);
    expect(profilesAfter[0].operationSucceeded).toBe(false);
  });
});

function getProfilerEventsByKind(kind) {
  return getProfilerData().filter(
    (d) =>
      d.type === "application" &&
      d.name === "profiler-basics" &&
      d.kind === kind
  );
}
