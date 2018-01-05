export default function() {
  describe(`happy-basic`, () => {
    let myApp;

    beforeAll(() => {
      singleSpa.registerApplication('./happy-basic.app.js', () => System.import('./happy-basic.app.js'), location => location.hash === "#happy-basic");
    });

    beforeEach(done => {
      location.hash = '#happy-basic';

      System
      .import('./happy-basic.app.js')
      .then(app => myApp = app)
      .then(app => app.reset())
      .then(done)
      .catch(err => {throw err})
    })

    it(`goes through the whole lifecycle successfully`, (done) => {
      expect(myApp.isMounted()).toEqual(false);
      expect(singleSpa.getMountedApps()).toEqual([]);

      location.hash = 'happy-basic';

      singleSpa
      .triggerAppChange()
      .then(() => {
        expect(myApp.wasBootstrapped()).toEqual(true);
        expect(myApp.isMounted()).toEqual(true);
        expect(singleSpa.getMountedApps()).toEqual(['./happy-basic.app.js']);

        location.hash = '#not-happy-basic';

        singleSpa
        .triggerAppChange()
        .then(() => {
          expect(myApp.wasBootstrapped()).toEqual(true);
          expect(myApp.isMounted()).toEqual(false);
          expect(singleSpa.getMountedApps()).toEqual([]);
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
      })
    });
  });
}
