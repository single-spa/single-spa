const activeHash = `#uses-loader`;

export default function() {
  describe(`uses-loader app`, () => {
    let myApp;

    beforeAll(() => {
      singleSpa.registerApplication('./uses-loader.app.js', location => location.hash === activeHash);
    });

    beforeEach(done => {
      location.hash = activeHash;

      System
      .import('./uses-loader.app.js')
      .then(app => myApp = app)
      .then(app => app.reset())
      .then(done)
      .catch(err => {throw err})
    });

    it(`works just fine if you don't provide a loadImpl function but instead depend on the setLoader`, done => {
      singleSpa
      .triggerAppChange()
      .then(() => {
        expect(myApp.bootstrapWasCalled()).toBe(true);
        expect(myApp.mountWasCalled()).toBe(true);
        expect(myApp.unmountWasCalled()).toBe(false);
        expect(singleSpa.getAppStatus('./uses-loader.app.js')).toEqual(singleSpa.MOUNTED);
        done();
      })
      .catch(err => {
        fail(err);
        done();
      });
    });
  });
}
