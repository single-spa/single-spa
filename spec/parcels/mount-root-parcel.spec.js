import * as singleSpa from "single-spa";

describe(`root parcels`, () => {
  it(`can mount and unmount root parcels`, () => {
    const parcelConfig = createParcelConfig();
    const parcel = singleSpa.mountRootParcel(parcelConfig, {
      domElement: document.createElement("div"),
    });
    expect(parcel.getStatus()).toBe(singleSpa.NOT_BOOTSTRAPPED);

    return parcel.mountPromise
      .then(() => {
        expect(parcel.getStatus()).toBe(singleSpa.MOUNTED);
      })
      .then(
        () =>
          new Promise((resolve, reject) => {
            setTimeout(resolve, 20);
          })
      )
      .then(parcel.unmount)
      .then(() => {
        expect(parcel.getStatus()).toBe(singleSpa.NOT_MOUNTED);
      });
  });

  it(`doesn't resolve bootstrapPromise, mountPromise, or unmountPromise with any values`, () => {
    const parcelConfig = createParcelConfig();
    const parcel = singleSpa.mountRootParcel(parcelConfig, {
      domElement: document.createElement("div"),
    });
    expect(parcel.getStatus()).toBe(singleSpa.NOT_BOOTSTRAPPED);

    return parcel.bootstrapPromise
      .then((value) => {
        expect(value).toBe(null);
        return parcel.mountPromise;
      })
      .then((value) => {
        expect(value).toBe(null);
        return Promise.all([parcel.unmountPromise, parcel.unmount()]);
      })
      .then((values) => {
        const [unmountPromiseValue, unmountValue] = values;
        expect(unmountPromiseValue).toBe(null);
        expect(unmountValue).toBe(null);
      });
  });

  it(`lets you call mountParcel with a config loading function instead of an actual parcel config`, () => {
    const parcelConfig = createParcelConfig();
    let resolveConfigLoading;
    const configLoadingFunction = () =>
      new Promise((resolve) => {
        resolveConfigLoading = () => resolve(parcelConfig);
      });
    const parcel = singleSpa.mountRootParcel(configLoadingFunction, {
      domElement: document.createElement("div"),
    });
    expect(parcel.getStatus()).toBe(singleSpa.LOADING_SOURCE_CODE);
    return Promise.resolve()
      .then(() =>
        expect(parcel.getStatus()).toBe(singleSpa.LOADING_SOURCE_CODE)
      )
      .then(() => resolveConfigLoading())
      .then(() => parcel.loadPromise)
      .then(() =>
        expect(parcel.getStatus()).not.toBe(singleSpa.LOADING_SOURCE_CODE)
      )
      .then(() => parcel.mountPromise)
      .then(() => expect(parcel.getStatus()).toBe(singleSpa.MOUNTED))
      .then(() => parcel.unmount())
      .then(() => expect(parcel.getStatus()).toBe(singleSpa.NOT_MOUNTED))
      .then(() => parcel.unmountPromise);
  });

  it(`allows you to update a parcel that has implemented the update lifecycle`, () => {
    const parcelConfig = createParcelConfig({ withUpdate: true });
    const parcel = singleSpa.mountRootParcel(parcelConfig, {
      domElement: document.createElement("div"),
    });

    return parcel.mountPromise
      .then(() => expect(typeof parcel.update).toBe("function"))
      .then(() => expect(parcelConfig.updateCalls).toBe(0))
      .then(() => parcel.update({}))
      .then((resolvedVal) => expect(resolvedVal).toBe(null))
      .then(() => expect(parcelConfig.updateCalls).toBe(1));
  });

  it(`does not allow you to call update on a parcel that does not implement the update lifecycle`, () => {
    const parcelConfig = createParcelConfig();
    const parcel = singleSpa.mountRootParcel(parcelConfig, {
      domElement: document.createElement("div"),
    });

    return parcel.mountPromise.then(() =>
      expect(parcel.update).toBeUndefined()
    );
  });

  it(`can mount a parcel missing the bootstrap lifecycle`, async () => {
    const parcelConfig = { async mount() {}, async unmount() {} };
    const parcel = singleSpa.mountRootParcel(parcelConfig, {
      domElement: document.createElement("div"),
    });
    await parcel.mountPromise;
  });

  it(`can mount a parcel that doesn't have the Object prototype`, async () => {
    // Simulate an ES module, which doesn't have the object prototype
    const parcelConfig = Object.create(null);
    parcelConfig.mount = async function () {};
    parcelConfig.unmount = async function () {};
    const parcel = singleSpa.mountRootParcel(parcelConfig, {
      domElement: document.createElement("div"),
    });
    await parcel.mountPromise;
  });

  // https://github.com/single-spa/single-spa/issues/656
  it(`can unmount a parcel that is still waiting for mount to finish`, async () => {
    const parcelConfig = createParcelConfig();
    const parcel = singleSpa.mountRootParcel(parcelConfig, {
      domElement: document.createElement("div"),
    });
    await parcel.unmount();
  });
});

function createParcelConfig(opts = {}) {
  const parcelConfig = {
    bootstrapCalls: 0,
    bootstrap() {
      parcelConfig.bootstrapCalls++;
      return Promise.resolve();
    },
    mountCalls: 0,
    mountProps: null,
    mount(props) {
      parcelConfig.mountCalls++;
      parcelConfig.mountProps = props;
      return Promise.resolve();
    },
    unmountCalls: 0,
    unmount() {
      parcelConfig.unmountCalls++;
      return Promise.resolve();
    },
  };

  if (opts.withUpdate) {
    parcelConfig.updateCalls = 0;
    parcelConfig.update = function (props) {
      parcelConfig.updateCalls++;
      return Promise.resolve();
    };
  }

  return parcelConfig;
}
