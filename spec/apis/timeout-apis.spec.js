import * as singleSpa from 'single-spa'
import { setBootstrapMaxTime } from '../../src/single-spa';

describe('global timeout configuration', () => {
  let consoleWarnSpy, consoleErrSpy

  beforeAll(() => {
    consoleWarnSpy = jest.spyOn(console, 'warn');
    consoleErrSpy = jest.spyOn(console, 'error');
  })

  afterAll(() => {
    consoleWarnSpy.mockRestore()
    consoleErrSpy.mockRestore()
  })

  afterEach(() => {
    consoleWarnSpy.mockReset()
    consoleErrSpy.mockReset()
  })

  describe('setBootstrapMaxTime', () => {
    afterEach(() => {
      setBootstrapMaxTime(5000, false, 1000);
    });

    it(`respects the millis configuration option`, () => {
      return Promise.resolve()
        .then(() => setBootstrapMaxTime(5, false, 1000))
        .then(() => singleSpa.mountRootParcel(...generateParcel('bootstrap-0', 5)).bootstrapPromise)
        .then(() => {
          expect(consoleErrSpy).not.toHaveBeenCalled();
        })
        .then(() => singleSpa.mountRootParcel(...generateParcel('bootstrap-1', 10)).bootstrapPromise)
        .then(() => {
          expectError(`Bootstrapping appOrParcel 'bootstrap-1' did not resolve or reject for 5 milliseconds -- we're no longer going to warn you about it.`)
        })
    });

    it(`respects the dieOnTimeout configuration option`, () => {
      return expect(Promise.resolve()
        .then(() => setBootstrapMaxTime(5, true, 1000))
        .then(() => singleSpa.mountRootParcel(...generateParcel('bootstrap-2', 10)).bootstrapPromise)
      ).rejects.toThrowError(`Parcel 'bootstrap-2' died in status SKIP_BECAUSE_BROKEN: Bootstrapping appOrParcel 'bootstrap-2' did not resolve or reject for 5 milliseconds`)
    });

    it(`respects warningMillis configuration option`, () => {
      return Promise.resolve()
        .then(() => setBootstrapMaxTime(15, false, 5))
        .then(() => singleSpa.mountRootParcel(...generateParcel('bootstrap-3', 0)).bootstrapPromise)
        .then(() => {
          expect(consoleWarnSpy).not.toHaveBeenCalled()
        })
        .then(() => singleSpa.mountRootParcel(...generateParcel('bootstrap-4', 10)).bootstrapPromise)
        .then(() => {
          expectWarning(`Bootstrapping appOrParcel 'bootstrap-4' did not resolve or reject within 5 milliseconds`)
        })
    });
  })

  function expectWarning(message) {
    expect(consoleWarnSpy).toHaveBeenCalled()
    const found = consoleWarnSpy.mock.calls.some(call => call[0] === message)
    if (!found) {
      expect(consoleWarnSpy).toHaveBeenCalledWith(message)
    }
  }

  function expectError(message) {
    expect(consoleErrSpy).toHaveBeenCalled()
    const found = consoleErrSpy.mock.calls.some(call => call[0] === message)
    if (!found) {
      expect(consoleErrSpy).toHaveBeenCalledWith(message)
    }
  }
})

function generateParcel(name, delay = 0) {
  return [
    {
      name,
      bootstrap: () => new Promise(resolve => {
        setTimeout(resolve, delay);
      }),
      mount: () => new Promise(resolve => {
        setTimeout(resolve, delay);
      }),
      update: () => new Promise(resolve => {
        setTimeout(resolve, delay);
      }),
      unmount: () => new Promise(resolve => {
        setTimeout(resolve, delay);
      }),
      unload: () => new Promise(resolve => {
        setTimeout(resolve, delay);
      }),
    },
    {
      domElement: document.createElement('div')
    },
  ];
}