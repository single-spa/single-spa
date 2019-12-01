import * as singleSpa from 'single-spa'

describe('global timeout configuration', () => {
  let consoleWarnSpy, consoleErrSpy, parcel

  beforeAll(() => {
    consoleWarnSpy = jest.spyOn(console, 'warn');
    consoleErrSpy = jest.spyOn(console, 'error');
    jest.useFakeTimers()
    singleSpa.start()
  })

  afterAll(() => {
    consoleWarnSpy.mockRestore()
    consoleErrSpy.mockRestore()
    jest.useRealTimers()
  })

  afterEach(() => {
    consoleWarnSpy.mockReset()
    consoleErrSpy.mockReset()
    jest.clearAllTimers()
  })

  describe('setBootstrapMaxTime', () => {
    afterEach(() => {
      singleSpa.setBootstrapMaxTime(5000, false, 1000);
    });

    it(`respects the millis configuration option`, async () => {
      singleSpa.setBootstrapMaxTime(5, false, 1000)

      await controlledParcelActions(parcel => parcel.bootstrapPromise, 'bootstrap-0', 3)
      expect(consoleErrSpy).not.toHaveBeenCalled();

      await controlledParcelActions(parcel => parcel.bootstrapPromise, 'bootstrap-1', 10)
      expectError(`Bootstrapping appOrParcel 'bootstrap-1' did not resolve or reject for 5 milliseconds -- we're no longer going to warn you about it.`)
    });

    it(`respects warningMillis configuration option`, async () => {
      singleSpa.setBootstrapMaxTime(15, false, 5)

      await controlledParcelActions(parcel => parcel.bootstrapPromise, 'bootstrap-2', 0)
      expect(consoleWarnSpy).not.toHaveBeenCalled()

      await controlledParcelActions(parcel => parcel.bootstrapPromise, 'bootstrap-3', 10)
      expectWarning(`Bootstrapping appOrParcel 'bootstrap-3' did not resolve or reject within 5 milliseconds`)
    });
  })

  describe('setMountMaxTime', () => {
    afterEach(() => {
      singleSpa.setMountMaxTime(5000, false, 1000);
    });

    it(`respects the millis configuration option`, async () => {
      singleSpa.setMountMaxTime(5, false, 1000)

      await controlledParcelActions(parcel => parcel.mountPromise, 'mount-0', 0, 3)
      expect(consoleErrSpy).not.toHaveBeenCalled();

      await controlledParcelActions(parcel => parcel.mountPromise, 'mount-1', 0, 10)
      expectError(`Mounting appOrParcel 'mount-1' did not resolve or reject for 5 milliseconds -- we're no longer going to warn you about it.`)
    });

    it(`respects warningMillis configuration option`, async () => {
      singleSpa.setMountMaxTime(15, false, 5)

      await controlledParcelActions(parcel => parcel.mountPromise, 'mount-2', 0, 3)
      expect(consoleWarnSpy).not.toHaveBeenCalled()

      await controlledParcelActions(parcel => parcel.mountPromise, 'mount-3', 0, 10)
      expectWarning(`Mounting appOrParcel 'mount-3' did not resolve or reject within 5 milliseconds`)
    });
  })

  describe('setUnmountMaxTime', () => {
    const unmount = async parcel => {
      await parcel.mountPromise
      await parcel.unmount()
    }

    afterEach(() => {
      singleSpa.setUnmountMaxTime(5000, false, 1000);
    });

    it(`respects the millis configuration option`, async () => {
      singleSpa.setUnmountMaxTime(5, false, 1000)

      await controlledParcelActions(unmount, 'unmount-0', 0, 0, 0, 3)
      expect(consoleErrSpy).not.toHaveBeenCalled();

      await controlledParcelActions(unmount, 'unmount-1', 0, 0, 0, 10)
      expectError(`Unmounting appOrParcel 'unmount-1' did not resolve or reject for 5 milliseconds -- we're no longer going to warn you about it.`)
    });

    it(`respects warningMillis configuration option`, async () => {
      singleSpa.setUnmountMaxTime(15, false, 5)

      await controlledParcelActions(unmount, 'unmount-2', 0, 0, 0, 3)
      expect(consoleWarnSpy).not.toHaveBeenCalled()

      await controlledParcelActions(unmount, 'unmount-3', 0, 0, 0, 10)
      expectWarning(`Unmounting appOrParcel 'unmount-3' did not resolve or reject within 5 milliseconds`)
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

async function controlledParcelActions(action, ...parcelArgs) {
  const parcel = singleSpa.mountRootParcel(...generateParcel(...parcelArgs))
  await flushPromises()
  jest.advanceTimersByTime(2)
  await flushPromises()
  jest.advanceTimersByTime(1)
  await flushPromises()
  jest.advanceTimersByTime(2)
  await flushPromises()
  jest.advanceTimersByTime(7)
  const actionPromise = action(parcel)
  await flushPromises()
  jest.advanceTimersByTime(3)
  await flushPromises()
  jest.advanceTimersByTime(7)
  await actionPromise
}

// https://github.com/facebook/jest/issues/2157#issuecomment-279171856
function flushPromises() {
  return new Promise(resolve => setImmediate(resolve));
}