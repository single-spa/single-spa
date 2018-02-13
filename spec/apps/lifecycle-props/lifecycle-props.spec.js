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
        expect(myApp.getBootstrapProps().name).toEqual('lifecycle-props');
        expect(myApp.getMountProps().name).toEqual('lifecycle-props');
        expect(myApp.getUnmountProps().name).toEqual('lifecycle-props');
        expect(myApp.getUnloadProps().name).toEqual('lifecycle-props');
      })
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
        expect(myApp.getBootstrapProps().customProps).toEqual({test: 'test'});
        expect(myApp.getMountProps().customProps).toEqual({test: 'test'});
        expect(myApp.getUnmountProps().customProps).toEqual({test: 'test'});
        expect(myApp.getUnloadProps().customProps).toEqual({test: 'test'});
      })
    });
});
