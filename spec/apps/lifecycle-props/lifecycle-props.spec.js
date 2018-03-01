import * as singleSpa from 'single-spa';

const activeHash = `#lifecycle-props`;

describe(`lifecycle-props app`, () => {
  let myApp;

  beforeAll(() => {
    singleSpa.start();
  })

  beforeEach(() => {
    return import('./lifecycle-props.app.js')
      .then(app => myApp = app)
      .then(app => app.reset())
  });

  it(`is given the correct props for each lifecycle function`, () => {

    singleSpa.registerApplication('lifecycle-props', () => System.import('./lifecycle-props.app.js'), location => location.hash === activeHash);

    // This mounts the app
    window.location.hash = activeHash;

    return singleSpa
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
        expectPropsToBeCorrect(myApp.getBootstrapProps())
        expectPropsToBeCorrect(myApp.getMountProps())
        expectPropsToBeCorrect(myApp.getUnmountProps())
        expectPropsToBeCorrect(myApp.getUnloadProps())
      })

    function expectPropsToBeCorrect(props) {
      expect(props.appName).toEqual('lifecycle-props')
      expect(props.customProps).toEqual({})
      expect(props.singleSpa).toBeDefined()
      expect(props.singleSpa.getAppStatus).toBeDefined()
    }
  });

  it(`is given the correct props for each lifecycle function if customProps are passed`, () => {

    singleSpa.registerApplication('lifecycle-props-customProps', () => System.import('./lifecycle-props.app.js'), location => location.hash === activeHash, {test: 'test'});

    // This mounts the app
    window.location.hash = activeHash;

    return singleSpa
      .triggerAppChange()
      .then(() => {
        // This unmounts the app
        window.location.hash = `#/no-app`;
        return singleSpa.triggerAppChange();
      })
      .then(() => singleSpa.unloadApplication('lifecycle-props-customProps'))
      .then(() => {
        expectPropsToBeCorrect(myApp.getBootstrapProps())
        expectPropsToBeCorrect(myApp.getMountProps())
        expectPropsToBeCorrect(myApp.getUnmountProps())
        expectPropsToBeCorrect(myApp.getUnloadProps())

        function expectPropsToBeCorrect(props) {
          expect(props.appName).toEqual('lifecycle-props-customProps')
          expect(props.customProps).toEqual({test: 'test'})
          expect(props.singleSpa).toBeDefined()
          expect(props.singleSpa.getAppStatus).toBeDefined()
        }
      })
    });
});
