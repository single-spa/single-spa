export default function parcelTests() {
  fdescribe('applications mounting parcels :', () => {
    let parcelConfig, shouldAppBeMounted, app, domEl;

    beforeEach(() => {
      parcelConfig = null;
      shouldAppBeMounted = false;
      domEl = null;

      app = {
        bootstrapCalls: 0,
        bootstrap() {
          app.bootstrapCalls++;
          return Promise.resolve();
        },
        mountCalls: 0,
        mount(props) {
          app.mountCalls++;
          return Promise
            .resolve()
            .then(() => props.mountParcel(parcelConfig, {domElement: domEl}))
        },
        unmountCalls: 0,
        unmount() {
          app.unmountCalls++;
          return Promise.resolve();
        },
      };

      const activityFn = () => shouldAppBeMounted;

      singleSpa.registerApplication('app-that-mounts-parcels', app, activityFn);
    });

    it(`can mount and unmount a parcel (happy path)`, done => {
      parcelConfig = {
        bootstrapCalls: 0,
        bootstrap() {
          parcelConfig.bootstrapCalls++;
          return Promise.resolve();
        },
        mountCalls: 0,
        mount(props) {
          parcelConfig.mountCalls++;
          return Promise.resolve();
        },
        unmountCalls: 0,
        unmount() {
          parcelConfig.unmountCalls++;
          return Promise.resolve();
        },
      };

      domEl = document.createElement('div');

      shouldAppBeMounted = true;

      expect(app.bootstrapCalls).toBe(0);
      expect(app.mountCalls).toBe(0);
      expect(app.unmountCalls).toBe(0);

      expect(parcelConfig.bootstrapCalls).toBe(0);
      expect(parcelConfig.mountCalls).toBe(0);
      expect(parcelConfig.unmountCalls).toBe(0);

      singleSpa
        .triggerAppChange()
        .then(() => {
          expect(app.bootstrapCalls).toBe(1);
          expect(app.mountCalls).toBe(1);
          expect(app.unmountCalls).toBe(0);

          expect(parcelConfig.bootstrapCalls).toBe(1);
          expect(parcelConfig.mountCalls).toBe(1);
          expect(parcelConfig.unmountCalls).toBe(0);

          shouldAppBeMounted = false;
          return singleSpa.triggerAppChange();
        })
        .then(() => {
          expect(app.bootstrapCalls).toBe(1);
          expect(app.mountCalls).toBe(1);
          expect(app.unmountCalls).toBe(1);

          expect(parcelConfig.bootstrapCalls).toBe(1);
          expect(parcelConfig.mountCalls).toBe(1);
          expect(parcelConfig.unmountCalls).toBe(1);

          done();
        });
    });

    it(`can mount and unmount a parcel after the app is mounted (happy path)`, done => {
      parcelConfig = {
        bootstrapCalls: 0,
        bootstrap() {
          parcelConfig.bootstrapCalls++;
          return Promise.resolve();
        },
        mountCalls: 0,
        mount(props) {
          parcelConfig.mountCalls++;
          return Promise.resolve();
        },
        unmountCalls: 0,
        unmount() {
          parcelConfig.unmountCalls++;
          return Promise.resolve();
        },
      };

      app.mount = function(props) {
        app.mountCalls++;
        app.mountProps = props;

        return Promise.resolve()
      }

      domEl = document.createElement('div');

      shouldAppBeMounted = true;

      expect(app.bootstrapCalls).toBe(0);
      expect(app.mountCalls).toBe(0);
      expect(app.unmountCalls).toBe(0);

      expect(parcelConfig.bootstrapCalls).toBe(0);
      expect(parcelConfig.mountCalls).toBe(0);
      expect(parcelConfig.unmountCalls).toBe(0);

      singleSpa
        .triggerAppChange()
        .then(() => {
          expect(app.bootstrapCalls).toBe(1);
          expect(app.mountCalls).toBe(1);
          expect(app.unmountCalls).toBe(0);

          const parcel = app.mountProps.mountParcel(parcelConfig, {domElement: domEl})
          return parcel.mountPromise;
        })
        .then(() => {
          expect(parcelConfig.bootstrapCalls).toBe(1);
          expect(parcelConfig.mountCalls).toBe(1);
          expect(parcelConfig.unmountCalls).toBe(0);

          shouldAppBeMounted = false;
          return singleSpa.triggerAppChange();
        })
        .then(() => {
          expect(app.bootstrapCalls).toBe(1);
          expect(app.mountCalls).toBe(1);
          expect(app.unmountCalls).toBe(1);

          expect(parcelConfig.bootstrapCalls).toBe(1);
          expect(parcelConfig.mountCalls).toBe(1);
          expect(parcelConfig.unmountCalls).toBe(1);

          done();
        });
    });
  });
}
