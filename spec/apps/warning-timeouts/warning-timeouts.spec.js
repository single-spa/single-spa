import * as singleSpa from 'single-spa';

const activeHash = `#warning-timeouts`;

describe(`warning-timeouts app`, () => {
  let errs, myApp, consoleWarnSpy;

  function handleError(err) {
    errs.push(err);
  }

  beforeAll(() => {
    singleSpa.registerApplication('warning-timeouts', () => import('./warning-timeouts.app'), location => location.hash === activeHash);
    singleSpa.start();
    consoleWarnSpy = jest.spyOn(console, 'warn')
  });

  afterAll(() => {
    consoleWarnSpy.mockRestore();
  });

  beforeEach(() => {
    errs = [];
    singleSpa.addErrorHandler(handleError);

    location.hash = '#';

    console.warn.mockReset()

    return import('./warning-timeouts.app')
      .then(app => myApp = app)
      .then(app => app.reset())
  })

  afterEach(() => {
    singleSpa.removeErrorHandler(handleError)
    return singleSpa.unloadApplication('warning-timeouts')
  });

  it(`doesn't warn if everything resolves before the default warning setting`, () => {
    location.hash = activeHash;

    return singleSpa
      .triggerAppChange()
      .then(() => {
        expect(singleSpa.getAppStatus('warning-timeouts')).toEqual('MOUNTED');
        expect(errs.length).toBe(0)
        expect(console.warn).not.toHaveBeenCalled()

        location.hash = '#not-warning-timeouts';

        return singleSpa
          .triggerAppChange()
          .then(() => {
            expect(singleSpa.getAppStatus('warning-timeouts')).toEqual('NOT_MOUNTED');
            expect(errs.length).toBe(0)
            expect(console.warn).not.toHaveBeenCalled()
          })
      })
  });

  it(`does warn if things don't resolve until after the default warning setting`, () => {
    myApp.setDelay(10)
    location.hash = activeHash;

    return singleSpa
      .triggerAppChange()
      .then(() => {
        expect(singleSpa.getAppStatus('warning-timeouts')).toEqual('MOUNTED');
        expect(errs.length).toBe(0)
        expectWarning(`Bootstrapping appOrParcel 'warning-timeouts' did not resolve or reject within 5 milliseconds`)
        expectWarning(`Mounting appOrParcel 'warning-timeouts' did not resolve or reject within 5 milliseconds`)

        location.hash = '#not-warning-timeouts';

        return singleSpa
          .triggerAppChange()
          .then(() => {
            expect(singleSpa.getAppStatus('warning-timeouts')).toEqual('NOT_MOUNTED');
            expect(errs.length).toBe(0)
          })
      })
  })

  function expectWarning(message) {
    expect(consoleWarnSpy).toHaveBeenCalled()
    const found = consoleWarnSpy.mock.calls.some(call => call[0] === message)
    if (!found) {
      expect(consoleWarnSpy).toHaveBeenCalledWith(message)
    }
  }
});