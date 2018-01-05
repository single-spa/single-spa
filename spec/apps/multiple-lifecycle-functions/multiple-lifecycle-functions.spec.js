const activeHash = `#multiple-lifecycle-functions`;

export default function() {
  describe(`multiple-lifecycle-functions app`, () => {
    let myApp;

    beforeAll(() => {
      singleSpa.registerApplication('./multiple-lifecycle-functions.app.js', () => System.import('./multiple-lifecycle-functions.app.js'), location => location.hash === activeHash);
    });

    beforeEach(done => {
      location.hash = activeHash;

      System
      .import('./multiple-lifecycle-functions.app.js')
      .then(app => myApp = app)
      .then(app => app.reset())
      .then(done)
      .catch(err => {throw err})
    })

    it(`waits for each of the functions one by one, in order`, (done) => {
      singleSpa
      .triggerAppChange()
      .then(() => {
        expect(myApp.bootstrapsCalledOutOfOrder()).toEqual(undefined);
        expect(myApp.bootstrap1Called()).toEqual(true);
        expect(myApp.bootstrap2Called()).toEqual(true);
        expect(myApp.bootstrap3Called()).toEqual(true);

        expect(myApp.mountsCalledOutOfOrder()).toEqual(undefined);
        expect(myApp.mount1Called()).toEqual(true);
        expect(myApp.mount2Called()).toEqual(true);
        expect(myApp.mount3Called()).toEqual(true);

        location.hash = '#not-multiple-lifecycle-functions';
        singleSpa
        .triggerAppChange()
        .then(() => {
          expect(myApp.unmountsCalledOutOfOrder()).toEqual(undefined);

          expect(myApp.unmount1Called()).toEqual(true);
          expect(myApp.unmount2Called()).toEqual(true);
          expect(myApp.unmount3Called()).toEqual(true);

          done();
        })
        .catch(ex => {
          fail(ex);
          done();
        });
      })
      .catch(ex => {
        fail(ex);
        done();
      });
    });
  });
}
