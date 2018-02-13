import * as singleSpa from 'single-spa';

const activeHash = `#uses-loader`;

describe(`uses-loader app`, () => {
  let myApp;

  beforeAll(() => {
    singleSpa.setLoader({'import': appName => import('./uses-loader.app.js')});
    singleSpa.registerApplication('./uses-loader.app.js', location => location.hash === activeHash);
    singleSpa.start();
  });

  beforeEach(() => {
    location.hash = activeHash;

    return import('./uses-loader.app.js')
      .then(app => myApp = app)
      .then(app => app.reset())
  });

  it(`works just fine if you don't provide a loadImpl function but instead depend on the setLoader`, () => {
    return singleSpa
      .triggerAppChange()
      .then(() => {
        expect(myApp.bootstrapWasCalled()).toBe(true);
        expect(myApp.mountWasCalled()).toBe(true);
        expect(myApp.unmountWasCalled()).toBe(false);
        expect(singleSpa.getAppStatus('./uses-loader.app.js')).toEqual(singleSpa.MOUNTED);
      })
  });
});
