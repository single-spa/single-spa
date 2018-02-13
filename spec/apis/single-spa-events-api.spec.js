import * as singleSpa from 'single-spa';

const dummyApp = {
  bootstrap() {return Promise.resolve()},
  mount() {return Promise.resolve()},
  unmount() {return Promise.resolve()},
  unload() {return Promise.resolve()},
};

describe(`events api :`, () => {
  beforeAll(() => {
    singleSpa.registerApplication('russell', dummyApp, () => window.location.hash.indexOf("#/russell") === 0);
    singleSpa.start();
  });

  describe(`single-spa:routing-event`, () => {
    beforeEach(() => {
      window.location.hash = ``;
    });

    it(`is fired on the window whenever the hash changes`, done => {
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
      .catch(err => {
        fail(err);
        done();
      });
    });

    it(`is fired on the window whenever the url changes`, done => {
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
      .catch(err => {
        fail(err);
        done();
      });
    });

    it(`doesn't destroy single-spa when you throw an error inside of an event listener`, () => {
      const ogOnError = window.onerror;
      window.onerror = function(err) {
        // We expect this to be called exactly once when we throw the error
        console.error(err);
        window.onerror = ogOnError;
      }

      function listener() {
        window.removeEventListener("single-spa:routing-event", listener);
        throw Error("Mwahaha I threw an error in an event listener");
      }

      window.addEventListener("single-spa:routing-event", listener);

      singleSpa
      .triggerAppChange()
      .then(() => window.onerror = ogOnError)
      .catch(err => {
        // If single-spa died because of the thrown error above, we've got a problem
        window.removeEventListener("single-spa:routing-event", listener);
        window.onerror = ogOnError;
        throw err
      });
    });
  });

  describe(`single-spa:app-change`, () => {
    it(`is fired when an app is unmounted`, done => {
      // console.log('starting app change')

      window.location.hash = `#`;

      singleSpa
      .triggerAppChange() // start with a clean slate (no previous tests doing anything)
      .then(() => {
        window.addEventListener("single-spa:app-change", finishTest);
        window.location.hash = `#/russell`;

        function finishTest() {
          // console.log("finishing test")
          window.removeEventListener("single-spa:app-change", finishTest);
          done();
        }

        return singleSpa.triggerAppChange();
      })
      .catch(err => {
        fail(err);
        done();
      });
    });

    it(`is not fired when no app is mounted`, done => {
      function failTest() {
        fail(`single-spa:app-change should not be called when no apps change`);
        window.removeEventListener("single-spa:app-change", failTest);
        done();
      }

      window.location.hash = ``;

      console.log("starting app change")

      singleSpa
      .triggerAppChange() 
      .then(() => {
        window.addEventListener("single-spa:app-change", failTest);
        window.location.hash = `#/not-a-real-app`;

        return singleSpa.triggerAppChange();
      })
      .then(() => {
        console.log("Trigger app change finished")
        window.removeEventListener("single-spa:app-change", failTest);

        // If failTest wasn't called, then we're good
        done();
      })
      .catch(err => {
        fail(err);
        done();
      });
    })
  });

  describe(`single-spa:no-app-change`, () => {
    it(`is fired when no app is loaded, bootstrapped, mounted, unmounted, or unloaded`, done => {
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
      .catch(err => {
        fail(err);
        done();
      });
    });
  });
});
