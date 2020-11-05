import * as singleSpa from "single-spa";

describe("parcel errors", () => {
  beforeAll(() => {
    singleSpa.start();
  });

  describe("lifecycle errors", () => {
    describe("bootstrap errors", () => {
      it(`should throw an error when bootstrapping fails`, async () => {
        const app = createApp();
        let shouldAppBeMounted = true;

        singleSpa.registerApplication(
          "parcel-bootstrap-errors",
          app,
          () => shouldAppBeMounted
        );
        await singleSpa.triggerAppChange();
        expect(app.mountCalls).toBe(1);

        const parcelConfig1 = createParcelConfig("bootstrap");
        parcelConfig1.name = "bootstrap-error";
        const parcel1 = app.mountProps.mountParcel(parcelConfig1, {
          domElement: document.createElement("div"),
        });
        await parcel1.bootstrapPromise.catch((err) => {
          expect(err.appOrParcelName).toBe("bootstrap-error");
          expect(err.message).toMatch(`BOOTSTRAPPING`);
          expect(err.message.indexOf(`bootstrap-error`)).toBeGreaterThan(-1);
          expect(parcel1.getStatus()).toBe("SKIP_BECAUSE_BROKEN");
        });
      });
    });

    describe("mount errors", () => {
      it(`should throw an error when mounting fails`, () => {
        const app = createApp();
        let shouldAppBeMounted = true;

        singleSpa.registerApplication(
          "parcel-mount-errors",
          app,
          () => shouldAppBeMounted
        );
        return singleSpa.triggerAppChange().then(() => {
          expect(app.mountCalls).toBe(1);

          const parcelConfig1 = createParcelConfig("mount");
          parcelConfig1.name = "mount-error";
          const parcel1 = app.mountProps.mountParcel(parcelConfig1, {
            domElement: document.createElement("div"),
          });
          return parcel1.mountPromise.catch((err) => {
            expect(err.appOrParcelName).toBe("mount-error");
            expect(err.message).toMatch("NOT_MOUNTED");
            expect(parcel1.getStatus()).toBe(singleSpa.SKIP_BECAUSE_BROKEN);
          });
        });
      });
    });

    describe("update errors", () => {
      it(`should throw an error if you call update on a parcel does not implement the 'update' lifecycle`, () => {
        const parcelConfig = createParcelConfig();
        const parcel = singleSpa.mountRootParcel(parcelConfig, {
          domElement: document.createElement("div"),
        });

        return parcel.mountPromise.then(() => {
          expect(() => parcel.update({})).toThrow();
        });
      });
    });

    describe("ummount errors", () => {
      describe(`parcel unmount itself errors`, () => {
        it(`should throw an error that you can catch when a parcel fails to unmount outside an app lifecycle`, () => {
          const app = createApp();
          let shouldAppBeMounted = true;

          singleSpa.registerApplication(
            "parcel-unmount-parcel-errors",
            app,
            () => shouldAppBeMounted
          );
          return singleSpa.triggerAppChange().then(() => {
            expect(app.mountCalls).toBe(1);

            const parcelConfig1 = createParcelConfig("unmount");
            parcelConfig1.name = "unmount-error";
            const parcel1 = app.mountProps.mountParcel(parcelConfig1, {
              domElement: document.createElement("div"),
            });
            return parcel1.mountPromise.then(() => {
              expect(parcel1.getStatus()).toBe("MOUNTED");
              expect(parcelConfig1.bootstrapCalls).toBe(1);
              expect(parcelConfig1.mountCalls).toBe(1);
              expect(parcelConfig1.unmountCalls).toBe(0);

              parcel1.unmount();
              expect(parcelConfig1.unmountCalls).toBe(0);
              return parcel1.unmountPromise
                .catch((err) => {
                  expect(err.appOrParcelName).toBe("unmount-error");
                  expect(err.message.indexOf(`UNMOUNTING`)).toBeGreaterThan(-1);
                  expect(err.message.indexOf(`unmount-error`)).toBeGreaterThan(
                    -1
                  );
                })
                .then(() => {
                  expect(parcel1.getStatus()).toBe("SKIP_BECAUSE_BROKEN");
                });
            });
          });
        });
      });

      describe(`parcel unmounted by app unmount errors`, () => {
        let errs;

        function handleError(err) {
          errs.push(err);
        }

        beforeEach(() => {
          errs = [];
          singleSpa.addErrorHandler(handleError);
        });

        afterEach(() => {
          expect(singleSpa.removeErrorHandler(handleError)).toBe(true);
        });

        it(`should throw an error when unmounting a parcel fails during app unmount`, () => {
          const app = createApp();
          let shouldAppBeMounted = true;

          singleSpa.registerApplication(
            "app-parcel-unmount-errors",
            app,
            () => shouldAppBeMounted
          );
          return singleSpa.triggerAppChange().then(() => {
            expect(app.mountCalls).toBe(1);

            const parcelConfig1 = createParcelConfig("unmount");
            parcelConfig1.name = "unmount-error";
            const parcel1 = app.mountProps.mountParcel(parcelConfig1, {
              domElement: document.createElement("div"),
            });
            return parcel1.mountPromise
              .then((results) => {
                expect(parcelConfig1.bootstrapCalls).toBe(1);
                expect(parcelConfig1.mountCalls).toBe(1);
                expect(parcelConfig1.unmountCalls).toBe(0);
              })
              .then(() => {
                shouldAppBeMounted = false;
                return singleSpa.triggerAppChange();
              })
              .then(() => {
                return parcel1.unmountPromise.catch((err) => {
                  expect(err.appOrParcelName).toBe("unmount-error");
                  expect(err.message.indexOf(`UNMOUNTING`)).toBeGreaterThan(-1);
                  expect(err.message.indexOf(`unmount-error`)).toBeGreaterThan(
                    -1
                  );
                });
              })
              .then(() => {
                expect(errs.length).toBe(1);
                expect(errs[0].appOrParcelName).toBe(
                  "app-parcel-unmount-errors"
                );
                expect(errs[0].message).toMatch(
                  /application 'app-parcel-unmount-errors' died in status NOT_MOUNTED: parcel 'unmount-error' died in status UNMOUNTING: unmount error/
                );
              });
          });
        });
      });
    });
  });

  describe(`invalid config`, () => {
    it(`throws an error immediately if you don't provide a config object`, () => {
      expect(() => {
        singleSpa.mountRootParcel(null, {
          domElement: document.createElement("div"),
        });
      }).toThrow();
    });

    it(`throws if your loading function doesn't return a valid config promise`, () => {
      expect(() => {
        // loading function should return promise
        singleSpa.mountRootParcel(() => createParcelConfig(), {
          domElement: document.createElement("div"),
        });
      }).toThrow();
    });

    it(`rejects the load promise if loading function returns a promise that resolves with undefined`, () => {
      const parcel = singleSpa.mountRootParcel(() => Promise.resolve(), {
        domElement: document.createElement("div"),
      });
      return parcel.loadPromise.then(
        () => {
          throw new Error("load promise should not have succeeded");
        },
        (err) => {
          expect(
            err.message.indexOf("did not resolve with a parcel config")
          ).toBeGreaterThan(-1);
        }
      );
    });

    it(`rejects the load promise if the config doesn't have a valid mount function`, () => {
      const parcel = singleSpa.mountRootParcel(
        { bootstrap() {}, unmount() {} },
        { domElement: document.createElement("div") }
      );
      return parcel.loadPromise.then(
        () => {
          throw new Error("load promise should not have succeeded");
        },
        (err) => {
          expect(
            err.message.indexOf("must have a valid mount function")
          ).toBeGreaterThan(-1);
        }
      );
    });

    it(`rejects the load promise if the config doesn't have a valid unmount function`, () => {
      const parcel = singleSpa.mountRootParcel(
        { bootstrap() {}, mount() {} },
        { domElement: document.createElement("div") }
      );
      return parcel.loadPromise.then(
        () => {
          throw new Error("load promise should not have succeeded");
        },
        (err) => {
          expect(
            err.message.indexOf("must have a valid unmount function")
          ).toBeGreaterThan(-1);
        }
      );
    });
  });
});

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
      if (errLocation === "bootstrap") {
        return Promise.reject(new Error("bootstrap error"));
      } else {
        parcelConfig.bootstrapCalls++;
        return Promise.resolve();
      }
    },
    mountCalls: 0,
    mountProps: null,
    mount(props) {
      if (errLocation === "mount") {
        return Promise.reject(new Error("mount error"));
      } else {
        parcelConfig.mountCalls++;
        parcelConfig.mountProps = props;
        return Promise.resolve();
      }
    },
    unmountCalls: 0,
    unmount() {
      if (errLocation === "unmount") {
        return Promise.reject(new Error("unmount error"));
      } else {
        parcelConfig.unmountCalls++;
        return Promise.resolve();
      }
    },
  };

  return parcelConfig;
}
