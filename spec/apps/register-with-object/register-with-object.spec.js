let bootstrapped, mounted;

const app = {
  bootstrap() {
    bootstrapped = true;
    return Promise.resolve();
  },
  mount() {
    mounted = true;
    return Promise.resolve();
  },
  unmount() {
    mounted = false;
    return Promise.resolve();
  },
};

export default function() {
  describe(`register-with-object`, () => {
    beforeAll(() => {
      singleSpa.registerApplication(
        'register-with-object',
        app,
        location => location.hash === "#register-with-object"
      );
    });

    beforeEach(() => {
      location.hash = '#not-register-with-object';

      bootstrapped = false;
      mounted = false;
    })

    it(`goes through the whole lifecycle successfully`, (done) => {
      expect(mounted).toEqual(false);
      expect(singleSpa.getMountedApps()).toEqual([]);

      location.hash = '#register-with-object';

      singleSpa
        .triggerAppChange()
        .then(() => {
          expect(bootstrapped).toEqual(true);
          expect(mounted).toEqual(true);
          expect(singleSpa.getMountedApps()).toEqual(['register-with-object']);

          location.hash = '#not-register-with-object';

          return singleSpa
            .triggerAppChange()
            .then(() => {
              expect(bootstrapped).toEqual(true);
              expect(mounted).toEqual(false);
              expect(singleSpa.getMountedApps()).toEqual([]);
              done();
            })
        })
        .catch(ex => {
          fail(ex);
          done();
        })
    });
  });
}
