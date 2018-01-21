const activeHash = `#lifecycle-props`;

export default function() {
  describe(`lifecycle-props app`, () => {
    let myApp;

    beforeEach(done => {
      System
      .import('./lifecycle-props.app.js')
      .then(app => myApp = app)
      .then(app => app.reset())
      .then(done)
      .catch(err => {
        fail(err);
        done();
      });
    });

    it(`is given the correct props for each lifecycle function`, done => {

      singleSpa.registerApplication('lifecycle-props', () => System.import('./lifecycle-props.app.js'), location => location.hash === activeHash);

      // This mounts the app
      window.location.hash = activeHash;

      singleSpa
      .triggerAppChange()
      .then(() => {
        // This unmounts the app
        window.location.hash = `#/no-app`;
        return singleSpa.triggerAppChange();
      })
      .then(() => {
        return singleSpa.unloadApplication('lifecycle-props');
      })
      .then(() => {
        expect(myApp.getBootstrapProps()).toEqual({appName: 'lifecycle-props', customProps: {}});
        expect(myApp.getMountProps()).toEqual({appName: 'lifecycle-props', customProps: {}});
        expect(myApp.getUnmountProps()).toEqual({appName: 'lifecycle-props', customProps: {}});
        expect(myApp.getUnloadProps()).toEqual({appName: 'lifecycle-props', customProps: {}});

        done();
      })
      .catch(err => {
        fail(err);
        done();
      });
    });

    it(`is given the correct props for each lifecycle function if customProps are passed`, done => {

      singleSpa.registerApplication('lifecycle-props-customProps', () => System.import('./lifecycle-props.app.js'), location => location.hash === activeHash, {test: 'test'});

      // This mounts the app
      window.location.hash = activeHash;

      singleSpa
        .triggerAppChange()
        .then(() => {
          // This unmounts the app
          window.location.hash = `#/no-app`;
          return singleSpa.triggerAppChange();
        })
        .then(() => {
          return singleSpa.unloadApplication('lifecycle-props-customProps');
        })
        .then(() => {
          expect(myApp.getBootstrapProps()).toEqual({appName: 'lifecycle-props-customProps', customProps: {test: 'test'}});
          expect(myApp.getMountProps()).toEqual({appName: 'lifecycle-props-customProps', customProps: {test: 'test'}});
          expect(myApp.getUnmountProps()).toEqual({appName: 'lifecycle-props-customProps', customProps: {test: 'test'}});
          expect(myApp.getUnloadProps()).toEqual({appName: 'lifecycle-props-customProps', customProps: {test: 'test'}});

          done();
        })
        .catch(err => {
          fail(err);
          done();
        });
      });
  });
}
