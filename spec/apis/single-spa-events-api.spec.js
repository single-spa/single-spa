import * as singleSpa from "single-spa";

const russellApp = {
  bootstrapCount: 0,
  mountCount: 0,
  unmountCount: 0,
  unloadCount: 0,
  bootstrap: async () => {
    russellApp.bootstrapCount++;
  },
  mount: async () => {
    russellApp.mountCount++;
  },
  unmount: async () => {
    russellApp.unmountCount++;
  },
  unload: async () => {
    russellApp.unloadCount++;
  },
};

const boomApp = {
  bootstrapCount: 0,
  mountCount: 0,
  unmountCount: 0,
  unloadCount: 0,
  bootstrap: async () => {
    boomApp.bootstrapCount++;
  },
  mount: async () => {
    boomApp.mountCount++;
  },
  unmount: async () => {
    boomApp.unmountCount++;
  },
  unload: async () => {
    boomApp.unloadCount++;
  },
};

describe(`events api :`, () => {
  let boom = false;

  beforeAll(() => {
    singleSpa.registerApplication(
      "russell",
      russellApp,
      () => window.location.hash.indexOf("#/russell") === 0
    );
    singleSpa.registerApplication("boom", boomApp, () => boom);
    singleSpa.start();
  });

  afterEach(async () => {
    russellApp.bootstrapCount = 0;
    russellApp.mountCount = 0;
    russellApp.unmountCount = 0;
    russellApp.unloadCount = 0;

    boomApp.bootstrapCount = 0;
    boomApp.mountCount = 0;
    boomApp.unmountCount = 0;
    boomApp.unloadCount = 0;

    boom = false;
    location.hash = "#/";
    await singleSpa.triggerAppChange();
  });

  describe(`single-spa:routing-event`, () => {
    beforeEach(() => {
      window.location.hash = ``;
      boom = false;
    });

    it(`is fired on the window whenever the hash changes`, (done) => {
      singleSpa
        .triggerAppChange() // start with a clean slate (no previous tests doing anything)
        .then(() => {
          window.addEventListener("single-spa:routing-event", finishTest);
          window.location.hash = `#/hash-was-changed`;

          function finishTest() {
            window.removeEventListener("single-spa:routing-event", finishTest);
            done();
          }
        })
        .catch(fail);
    });

    it(`is fired on the window whenever the url changes`, (done) => {
      singleSpa
        .triggerAppChange() // start with a clean slate (no previous tests doing anything)
        .then(() => {
          window.addEventListener("single-spa:routing-event", finishTest);
          window.history.pushState({}, null, `#/push-state-called`);

          function finishTest() {
            window.removeEventListener("single-spa:routing-event", finishTest);
            done();
          }
        })
        .catch(fail);
    });

    it(`doesn't destroy single-spa when you throw an error inside of an event listener`, (done) => {
      const ogOnError = window.onerror;
      const counterFn = jest.fn();

      window.onerror = function (err) {
        counterFn();
        console.error(err);
        doneIfAllListenerHadBeenInvoked();
      };

      // If the counterFn had been called thrice, it means all listener be invoked.
      function doneIfAllListenerHadBeenInvoked() {
        if (counterFn.mock.calls.length === 3) {
          window.onerror = ogOnError;
          done();
        }
      }

      function listener() {
        window.removeEventListener("single-spa:routing-event", listener);
        throw Error("Mwahaha I threw an error in an event listener");
      }
      window.addEventListener("single-spa:routing-event", listener);

      function hashchangeListenerWithErr() {
        window.removeEventListener("hashchange", hashchangeListenerWithErr);
        throw Error("Mwahaha I threw an error in an hashchange event listener");
      }
      window.addEventListener("hashchange", hashchangeListenerWithErr);

      function hashchangeListener() {
        counterFn();
        window.removeEventListener("hashchange", hashchangeListener);
        doneIfAllListenerHadBeenInvoked();
      }
      window.addEventListener("hashchange", hashchangeListener);

      singleSpa
        .triggerAppChange()
        .then(() => (window.location.hash = "#/hashchange"))
        .catch((err) => {
          // If single-spa died because of the thrown error above, we've got a problem
          window.removeEventListener("single-spa:routing-event", listener);
          window.removeEventListener("hashchange", hashchangeListener);
          window.removeEventListener("hashchange", hashchangeListenerWithErr);
          window.onerror = ogOnError;
          fail(err);
        });
    });
  });

  describe("single-spa:before-mount-routing-event", () => {
    it(`is fired after before-routing-event but before routing-event`, async () => {
      let firedEvents = [];

      await singleSpa.triggerAppChange(); // start with a clean slate (no previous tests doing anything)
      window.addEventListener(
        "single-spa:before-routing-event",
        beforeRoutingEvent
      );
      window.addEventListener(
        "single-spa:before-mount-routing-event",
        beforeMountRoutingEvent
      );
      window.addEventListener("single-spa:routing-event", afterRoutingEvent);

      window.location.hash = `#/hash-was-changed`;
      await singleSpa.triggerAppChange();

      expect(firedEvents).toEqual([
        "before-routing-event",
        "before-mount-routing-event",
        "routing-event",
      ]);

      function beforeRoutingEvent() {
        window.removeEventListener(
          "single-spa:before-routing-event",
          beforeRoutingEvent
        );
        firedEvents.push("before-routing-event");
      }

      function beforeMountRoutingEvent() {
        window.removeEventListener(
          "single-spa:before-mount-routing-event",
          beforeMountRoutingEvent
        );
        firedEvents.push("before-mount-routing-event");
      }

      function afterRoutingEvent() {
        window.removeEventListener(
          "single-spa:routing-event",
          afterRoutingEvent
        );
        firedEvents.push("routing-event");
      }
    });

    it(`is fired after all applications have been unmounted, and before any have been mounted`, async () => {
      await singleSpa.triggerAppChange(); // start with a clean slate (no previous tests doing anything)

      // make sure boomApp is not mounted
      boom = false;

      location.hash = "#/russell";
      await singleSpa.triggerAppChange();

      window.addEventListener(
        "single-spa:before-mount-routing-event",
        listener
      );

      expect(singleSpa.getAppStatus("russell")).toBe(singleSpa.MOUNTED);
      expect(russellApp.unmountCount).toBe(0);
      expect(boomApp.mountCount).toBe(0);

      // now mount boomApp
      boom = true;
      location.hash = "#/other";
      await singleSpa.triggerAppChange();

      expect(singleSpa.getAppStatus("russell")).toBe(singleSpa.NOT_MOUNTED);
      expect(russellApp.unmountCount).toBe(1);
      expect(boomApp.mountCount).toBe(1);

      function listener() {
        window.removeEventListener(
          "single-spa:before-mount-routing-event",
          listener
        );

        // unmounts have been called
        expect(russellApp.unmountCount).toBe(1);

        // but mounts have not
        expect(boomApp.mountCount).toBe(0);
      }
    });
  });

  describe(`single-spa:app-change`, () => {
    it(`is fired when an app is mounted`, (done) => {
      window.location.hash = `#`;

      singleSpa
        .triggerAppChange() // start with a clean slate (no previous tests doing anything)
        .then(() => {
          window.addEventListener("single-spa:app-change", finishTest);
          window.location.hash = `#/russell`;

          function finishTest(evt) {
            const {
              detail: { appsByNewStatus, newAppStatuses, totalAppChanges },
            } = evt;
            window.removeEventListener("single-spa:app-change", finishTest);
            expect(appsByNewStatus[singleSpa.NOT_LOADED].sort()).toEqual([]);
            expect(
              appsByNewStatus[singleSpa.SKIP_BECAUSE_BROKEN].sort()
            ).toEqual([]);
            expect(appsByNewStatus[singleSpa.NOT_MOUNTED].sort()).toEqual([]);
            expect(appsByNewStatus[singleSpa.MOUNTED].sort()).toEqual(
              ["russell"].sort()
            );

            expect(totalAppChanges).toBe(1);

            expect(newAppStatuses).toEqual({
              russell: singleSpa.MOUNTED,
            });
            done();
          }

          return singleSpa.triggerAppChange();
        })
        .catch(fail);
    });

    it(`is fired with multiple apps that changed`, (done) => {
      window.location.hash = `#`;

      singleSpa
        .triggerAppChange() // start with a clean slate (no previous tests doing anything)
        .then(() => {
          boom = true; // turn on the boom application
          window.addEventListener("single-spa:app-change", finishTest);
          window.location.hash = `#/russell`;

          function finishTest(evt) {
            window.removeEventListener("single-spa:app-change", finishTest);
            const {
              detail: { appsByNewStatus, newAppStatuses, totalAppChanges },
            } = evt;
            expect(appsByNewStatus[singleSpa.NOT_LOADED].sort()).toEqual([]);
            expect(
              appsByNewStatus[singleSpa.SKIP_BECAUSE_BROKEN].sort()
            ).toEqual([]);
            expect(appsByNewStatus[singleSpa.NOT_MOUNTED].sort()).toEqual([]);
            expect(appsByNewStatus[singleSpa.MOUNTED].sort()).toEqual(
              ["russell", "boom"].sort()
            );

            expect(totalAppChanges).toBe(2);

            expect(newAppStatuses).toEqual({
              russell: singleSpa.MOUNTED,
              boom: singleSpa.MOUNTED,
            });
            done();
          }

          return singleSpa.triggerAppChange();
        })
        .catch(fail);
    });

    it(`is fired for unmounts`, (done) => {
      window.location.hash = `#/russell`;

      singleSpa
        .triggerAppChange() // start with a clean slate (no previous tests doing anything)
        .then(() => {
          window.addEventListener("single-spa:app-change", finishTest);
          window.location.hash = `#`;

          function finishTest(evt) {
            window.removeEventListener("single-spa:app-change", finishTest);
            const {
              detail: { appsByNewStatus, newAppStatuses, totalAppChanges },
            } = evt;
            expect(appsByNewStatus[singleSpa.NOT_LOADED].sort()).toEqual([]);
            expect(
              appsByNewStatus[singleSpa.SKIP_BECAUSE_BROKEN].sort()
            ).toEqual([]);
            expect(appsByNewStatus[singleSpa.MOUNTED].sort()).toEqual([]);
            expect(appsByNewStatus[singleSpa.NOT_MOUNTED].sort()).toEqual(
              ["russell"].sort()
            );

            expect(totalAppChanges).toBe(1);

            expect(newAppStatuses).toEqual({
              russell: singleSpa.NOT_MOUNTED,
            });
            done();
          }

          return singleSpa.triggerAppChange();
        })
        .catch(fail);
    });

    it(`fires with multiple statuses when things are both mounted and unmounted`, (done) => {
      window.location.hash = `#`; // unmount russell
      boom = true; // mount boom
      singleSpa
        .triggerAppChange() // start with a clean slate (no previous tests doing anything)
        .then(() => {
          window.addEventListener("single-spa:app-change", finishTest);
          window.location.hash = `#/russell`; // mount russell
          boom = false; // unmount boom

          function finishTest(evt) {
            const {
              detail: { appsByNewStatus, newAppStatuses, totalAppChanges },
            } = evt;
            window.removeEventListener("single-spa:app-change", finishTest);
            expect(appsByNewStatus[singleSpa.NOT_LOADED].sort()).toEqual([]);
            expect(
              appsByNewStatus[singleSpa.SKIP_BECAUSE_BROKEN].sort()
            ).toEqual([]);
            expect(appsByNewStatus[singleSpa.NOT_MOUNTED].sort()).toEqual(
              ["boom"].sort()
            );
            expect(appsByNewStatus[singleSpa.MOUNTED].sort()).toEqual(
              ["russell"].sort()
            );

            expect(totalAppChanges).toBe(2);

            expect(newAppStatuses).toEqual({
              boom: singleSpa.NOT_MOUNTED,
              russell: singleSpa.MOUNTED,
            });
            done();
          }

          return singleSpa.triggerAppChange();
        })
        .catch(fail);
    });

    it(`is not fired when no app is mounted`, (done) => {
      function failTest() {
        window.removeEventListener("single-spa:app-change", failTest);
        fail(`single-spa:app-change should not be called when no apps change`);
      }

      window.location.hash = `#`;

      singleSpa
        .triggerAppChange()
        .then(() => singleSpa.triggerAppChange())
        .then(() => {
          window.addEventListener("single-spa:app-change", failTest);
          window.location.hash = `#/not-a-real-app`;

          return singleSpa.triggerAppChange();
        })
        .then(() => {
          window.removeEventListener("single-spa:app-change", failTest);

          // If failTest wasn't called, then we're good
          done();
        })
        .catch(fail);
    });
  });

  describe(`single-spa:no-app-change`, () => {
    it(`is fired when no app is loaded, bootstrapped, mounted, unmounted, or unloaded`, (done) => {
      window.location.hash = `#`;

      singleSpa
        .triggerAppChange()
        .then(() => {
          window.addEventListener("single-spa:no-app-change", finishTest);
          window.location.hash = `#not-a-real-app`;

          function finishTest() {
            window.removeEventListener("single-spa:no-app-change", finishTest);
            done();
          }
        })
        .catch(fail);
    });
  });

  describe(`single-spa:before-app-change`, () => {
    it(`is fired before apps will change, and not fired if no apps are changing`, (done) => {
      window.location.hash = `#/russell`;

      singleSpa
        .triggerAppChange()
        .then(() => {
          expect(singleSpa.getAppStatus("boom")).toMatch(
            /NOT_MOUNTED|NOT_LOADED/
          );
          expect(singleSpa.getAppStatus("russell")).toBe(singleSpa.MOUNTED);
          window.addEventListener("single-spa:before-app-change", finishTest);
          window.addEventListener(
            "single-spa:before-no-app-change",
            finishTest
          );
          boom = true;
          window.location.hash = `#not-a-real-app`;

          function finishTest(evt) {
            window.removeEventListener(
              "single-spa:before-app-change",
              finishTest
            );
            window.removeEventListener(
              "single-spa:before-no-app-change",
              finishTest
            );
            expect(evt.type).toBe("single-spa:before-app-change");
            expect(singleSpa.getAppStatus("boom")).toMatch(
              /NOT_MOUNTED|NOT_LOADED/
            );
            expect(singleSpa.getAppStatus("russell")).toBe(singleSpa.MOUNTED);
            expect(evt.detail.appsByNewStatus[singleSpa.MOUNTED]).toEqual([
              "boom",
            ]);
            expect(evt.detail.appsByNewStatus[singleSpa.NOT_MOUNTED]).toEqual([
              "russell",
            ]);
            done();
          }
        })
        .catch(fail);
    });
  });

  describe(`single-spa:before-no-app-change`, () => {
    it(`is fired before apps will not change, and not fired if apps are changing`, (done) => {
      window.location.hash = `#/russell`;

      singleSpa
        .triggerAppChange()
        .then(() => {
          expect(singleSpa.getAppStatus("boom")).toMatch(
            /NOT_MOUNTED|NOT_LOADED/
          );
          expect(singleSpa.getAppStatus("russell")).toBe(singleSpa.MOUNTED);
          window.addEventListener(
            "single-spa:before-no-app-change",
            finishTest
          );
          window.addEventListener("single-spa:before-app-change", finishTest);
          singleSpa.triggerAppChange();

          function finishTest(evt) {
            window.removeEventListener(
              "single-spa:before-no-app-change",
              finishTest
            );
            window.removeEventListener(
              "single-spa:before-app-change",
              finishTest
            );
            expect(evt.type).toEqual("single-spa:before-no-app-change");
            expect(evt.detail.appsByNewStatus[singleSpa.MOUNTED]).toEqual([]);
            expect(evt.detail.appsByNewStatus[singleSpa.NOT_MOUNTED]).toEqual(
              []
            );
            done();
          }
        })
        .catch(fail);
    });
  });

  describe(`cancelNavigation`, () => {
    it(`allows you to cancel a hash navigation event in the before-routing-event handler`, (done) => {
      const beforeRoutingEvent = (evt) => {
        expect(evt.detail.oldUrl).toMatch(/http:\/\/localhost\/(#\/)?/);
        expect(evt.detail.newUrl).toBe("http://localhost/#/russell");

        if (new URL(evt.detail.newUrl).hash === "#/russell") {
          evt.detail.cancelNavigation();
        }
      };

      window.addEventListener(
        "single-spa:before-routing-event",
        beforeRoutingEvent
      );

      const originalStatus = singleSpa.getAppStatus("russell");
      const originalUrl = window.location.href;

      expect(originalStatus).toMatch(/NOT_MOUNTED|NOT_LOADED/);

      window.location.hash = `#/russell`;

      singleSpa
        .triggerAppChange()
        .then(() => {
          expect(singleSpa.getAppStatus("russell")).toBe(originalStatus);
          expect(window.location.href).toBe(originalUrl);
        })
        .catch(fail)
        .finally(() => {
          window.removeEventListener(
            "single-spa:before-routing-event",
            beforeRoutingEvent
          );
          done();
        });
    });

    it(`allows you to cancel a pushState navigation event in the before-routing-event handler`, async () => {
      await singleSpa.triggerAppChange("/");

      const app = { async mount() {}, async unmount() {} };
      singleSpa.registerApplication({
        name: "cancel-pushstate",
        app,
        activeWhen: "/cancel-pushstate",
      });

      const beforeRoutingEvent = (evt) => {
        window.removeEventListener(
          "single-spa:before-routing-event",
          beforeRoutingEvent
        );
        expect(evt.detail.oldUrl).toMatch(/http:\/\/localhost\/(#\/)?/);
        expect(evt.detail.newUrl).toBe("http://localhost/cancel-pushstate");

        if (new URL(evt.detail.newUrl).pathname === "/cancel-pushstate") {
          evt.detail.cancelNavigation();
        }
      };

      await singleSpa.triggerAppChange();

      window.addEventListener(
        "single-spa:before-routing-event",
        beforeRoutingEvent
      );

      const originalStatus = singleSpa.getAppStatus("russell");
      const originalUrl = window.location.href;

      expect(originalStatus).toMatch(/NOT_MOUNTED|NOT_LOADED/);

      singleSpa.navigateToUrl("/cancel-pushstate");

      await singleSpa.triggerAppChange();
      expect(singleSpa.getAppStatus("russell")).toBe(originalStatus);
      expect(window.location.href).toBe(originalUrl);
    });
  });
});
