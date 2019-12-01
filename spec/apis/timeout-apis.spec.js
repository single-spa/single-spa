import * as singleSpa from 'single-spa'

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
      singleSpa.setBootstrapMaxTime(5000, false, 1000);
    });

    it(`respects the millis configuration option`, () => {
      return Promise.resolve()
        .then(() => singleSpa.setBootstrapMaxTime(5, false, 1000))
        .then(() => singleSpa.mountRootParcel(...generateParcel('bootstrap-0', 5)).bootstrapPromise)
        .then(() => {
          expect(consoleErrSpy).not.toHaveBeenCalled();
        })
        .then(() => singleSpa.mountRootParcel(...generateParcel('bootstrap-1', 10)).bootstrapPromise)
        .then(() => {
          expectError(`Bootstrapping appOrParcel 'bootstrap-1' did not resolve or reject for 5 milliseconds -- we're no longer going to warn you about it.`)
        })
    });

    it(`respects warningMillis configuration option`, () => {
      return Promise.resolve()
        .then(() => singleSpa.setBootstrapMaxTime(15, false, 5))
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

  describe('setMountMaxTime', () => {
    afterEach(() => {
      singleSpa.setMountMaxTime(5000, false, 1000);
    });

    it(`respects the millis configuration option`, () => {
      return Promise.resolve()
        .then(() => singleSpa.setMountMaxTime(5, false, 1000))
        .then(() => singleSpa.mountRootParcel(...generateParcel('mount-0', 0, 5)).mountPromise)
        .then(() => {
          expect(consoleErrSpy).not.toHaveBeenCalled();
        })
        .then(() => singleSpa.mountRootParcel(...generateParcel('mount-1', 0, 10)).mountPromise)
        .then(() => {
          expectError(`Mounting appOrParcel 'mount-1' did not resolve or reject for 5 milliseconds -- we're no longer going to warn you about it.`)
        })
    });

    it(`respects warningMillis configuration option`, () => {
      return Promise.resolve()
        .then(() => singleSpa.setMountMaxTime(15, false, 5))
        .then(() => singleSpa.mountRootParcel(...generateParcel('mount-3', 0, 0)).mountPromise)
        .then(() => {
          expect(consoleWarnSpy).not.toHaveBeenCalled()
        })
        .then(() => singleSpa.mountRootParcel(...generateParcel('mount-4', 0, 10)).mountPromise)
        .then(() => {
          expectWarning(`Mounting appOrParcel 'mount-4' did not resolve or reject within 5 milliseconds`)
        })
    });
  })

  describe('setUnmountMaxTime', () => {
    afterEach(() => {
      singleSpa.setUnmountMaxTime(5000, false, 1000);
    });

    it(`respects the millis configuration option`, () => {
      return Promise.resolve()
        .then(() => singleSpa.setUnmountMaxTime(5, false, 1000))
        .then(() => {
          const parcel = singleSpa.mountRootParcel(...generateParcel('unmount-0', 0, 0, 0, 5))
          return parcel.mountPromise.then(() => parcel.unmount())
        })
        .then(() => {
          expect(consoleErrSpy).not.toHaveBeenCalled();
        })
        .then(() => {
          const parcel = singleSpa.mountRootParcel(...generateParcel('unmount-1', 0, 0, 0, 10))
          return parcel.mountPromise.then(() => parcel.unmount())
        })
        .then(() => {
          expectError(`Unmounting appOrParcel 'unmount-1' did not resolve or reject for 5 milliseconds -- we're no longer going to warn you about it.`)
        })
    });

    it(`respects warningMillis configuration option`, () => {
      return Promise.resolve()
        .then(() => singleSpa.setUnmountMaxTime(15, false, 5))
        .then(() => {
          const parcel = singleSpa.mountRootParcel(...generateParcel('unmount-2', 0, 0, 0, 5))
          return parcel.mountPromise.then(() => parcel.unmount())
        })
        .then(() => {
          expect(consoleWarnSpy).not.toHaveBeenCalled()
        })
        .then(() => {
          const parcel = singleSpa.mountRootParcel(...generateParcel('unmount-3', 0, 0, 0, 10))
          return parcel.mountPromise.then(() => parcel.unmount())
        })
        .then(() => {
          expectWarning(`Unmounting appOrParcel 'unmount-3' did not resolve or reject within 5 milliseconds`)
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

function generateParcel(name, bootstrapDelay = 0, mountDelay = 0, updateDelay = 0, unmountDelay = 0, unloadDelay = 0) {
  return [
    {
      name,
      bootstrap: () => new Promise(resolve => {
        setTimeout(resolve, bootstrapDelay);
      }),
      mount: () => new Promise(resolve => {
        setTimeout(resolve, mountDelay);
      }),
      update: () => new Promise(resolve => {
        setTimeout(resolve, updateDelay);
      }),
      unmount: () => new Promise(resolve => {
        setTimeout(resolve, unmountDelay);
      }),
      unload: () => new Promise(resolve => {
        setTimeout(resolve, unloadDelay);
      }),
    },
    {
      domElement: document.createElement('div')
    },
  ];
}