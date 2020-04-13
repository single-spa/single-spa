import * as singleSpa from "single-spa";

const dummyApp = {
  bootstrap() {
    return Promise.resolve();
  },
  mount() {
    return Promise.resolve();
  },
  unmount() {
    return Promise.resolve();
  },
  unload() {
    return Promise.resolve();
  },
};

describe(`events api :`, () => {
  let boom = false;

  beforeAll(() => {
    singleSpa.registerApplication(
      "russell",
      dummyApp,
      () => window.location.hash.indexOf("#/russell") === 0
    );
    singleSpa.registerApplication("boom", dummyApp, () => boom);
    singleSpa.start();
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
});
