import * as singleSpa from 'single-spa'

describe('parcel errors', () => {

  let errs

  function handleError(err) {
    errs.push(err)
  }

  beforeAll(() => {
    singleSpa.start()
  })

  beforeEach(() => {
    errs = []
    singleSpa.addErrorHandler(handleError)
  })

  afterEach(() => {
    expect(singleSpa.removeErrorHandler(handleError)).toBe(true)
  })

  describe('lifecycle errors', () => {

    describe('bootstrap errors', () => {

      it(`should throw an error when mounting fails`, () => {
        const app = createApp();
        let shouldAppBeMounted = true;

        singleSpa.registerApplication('parcel-bootstrap-errors', app, () => shouldAppBeMounted);
        return singleSpa.triggerAppChange().then(() => {
          expect(app.mountCalls).toBe(1)

          const parcelConfig1 = createParcelConfig('bootstrap')
          parcelConfig1.name = 'bootstrap-error'
          const parcel1 = app.mountProps.mountParcel(parcelConfig1, {domElement: document.createElement('div')})
          return parcel1.bootstrapPromise.catch(err => {
            expect(err.name).toBe('bootstrap-error');
            expect(err.message.indexOf(`SKIP_BECAUSE_BROKEN`)).toBeGreaterThan(-1);
            expect(err.message.indexOf(`bootstrap-error`)).toBeGreaterThan(-1);
          })
        })
      })

    })

    describe('mount errors', () => {

      it(`should throw an error when mounting fails`, () => {
        const app = createApp();
        let shouldAppBeMounted = true;

        singleSpa.registerApplication('parcel-mount-errors', app, () => shouldAppBeMounted);
        return singleSpa.triggerAppChange().then(() => {
          expect(app.mountCalls).toBe(1)

          const parcelConfig1 = createParcelConfig('mount')
          parcelConfig1.name = 'mount-error'
          const parcel1 = app.mountProps.mountParcel(parcelConfig1, {domElement: document.createElement('div')})
          return parcel1.mountPromise.catch(err => {
            expect(err.name).toBe('mount-error');
            expect(err.message.indexOf(`NOT_MOUNTED`)).toBeGreaterThan(-1);
          })
        })
      })

    })

    describe('ummount errors', () => {

      it(`should throw an error when unmounting fails`, () => {
        const app = createApp();
        let shouldAppBeMounted = true;

        singleSpa.registerApplication('app-parcel-unmount-errors', app, () => shouldAppBeMounted);
        return singleSpa.triggerAppChange().then(() => {
          expect(app.mountCalls).toBe(1)

          const parcelConfig1 = createParcelConfig('unmount')
          parcelConfig1.name = 'unmount-error'
          const parcel1 = app.mountProps.mountParcel(parcelConfig1, {domElement: document.createElement('div')})
          return parcel1.mountPromise.then((results) => {
            expect(parcelConfig1.bootstrapCalls).toBe(1)
            expect(parcelConfig1.mountCalls).toBe(1)
            expect(parcelConfig1.unmountCalls).toBe(0)
          }).then(() => {
            shouldAppBeMounted = false
            return singleSpa.triggerAppChange()
          }).then(() => {
            return parcel1.unmountPromise.catch(err => {
              expect(err.name).toBe('unmount-error');
              expect(err.message.indexOf(`UNMOUNTING`)).toBeGreaterThan(-1);
              expect(err.message.indexOf(`unmount-error`)).toBeGreaterThan(-1);
            })
          })
        })
      })

    })

  })

})

function createApp() {
  const app = {
    bootstrapCalls: 0,
    bootstrap() {
      app.bootstrapCalls++;
      return Promise.resolve();
    },
    mountCalls: 0,
    mountProps: null,
    mount(props) {
      app.mountCalls++;
      app.mountProps = props;
      return Promise.resolve();
    },
    unmountCalls: 0,
    unmount() {
      app.unmountCalls++;
      return Promise.resolve();
    },
  };

  return app;
}

function createParcelConfig(errLocation) {
  const parcelConfig = {
    bootstrapCalls: 0,
    bootstrap() {
      if (errLocation === 'bootstrap') {
        return Promise.reject(new Error('bootstrap error'))
      } else {
        parcelConfig.bootstrapCalls++;
        return Promise.resolve();
      }
    },
    mountCalls: 0,
    mountProps: null,
    mount(props) {
      if (errLocation === 'mount') {
        return Promise.reject(new Error('mount error'))
      } else {
        parcelConfig.mountCalls++;
        parcelConfig.mountProps = props;
        return Promise.resolve();
      }
    },
    unmountCalls: 0,
    unmount() {
      if (errLocation === 'unmount') {
        return Promise.reject(new Error('ummount error'))
      } else {
        parcelConfig.unmountCalls++;
        return Promise.resolve();
      }
    },
  };

  return parcelConfig;
}
