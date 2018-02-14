import * as singleSpa from 'single-spa';

describe(`root parcels`, () => {
  it(`can mount and unmount root parcels`, () => {
    const parcelConfig = createParcelConfig();
    const parcel = singleSpa.mountRootParcel(parcelConfig, {domElement: document.createElement('div')});
    expect(parcel.getStatus()).toBe(singleSpa.NOT_BOOTSTRAPPED);

    return parcel
      .mountPromise
      .then(() => {
        expect(parcel.getStatus()).toBe(singleSpa.MOUNTED);
      })
      .then(() => new Promise((resolve, reject) => {
        setTimeout(resolve, 20);
      }))
      .then(parcel.unmount)
      .then(() => {
        expect(parcel.getStatus()).toBe(singleSpa.NOT_MOUNTED);
      })
  });

  it(`doesn't resolve bootstrapPromise, mountPromise, or unmountPromise with any values`, () => {
    const parcelConfig = createParcelConfig();
    const parcel = singleSpa.mountRootParcel(parcelConfig, {domElement: document.createElement('div')});
    expect(parcel.getStatus()).toBe(singleSpa.NOT_BOOTSTRAPPED);

    return parcel
      .bootstrapPromise
      .then(value => {
        expect(value).toBe(null);
        return parcel.mountPromise;
      })
      .then(value => {
        expect(value).toBe(null);
        return Promise.all([
          parcel.unmountPromise,
          parcel.unmount(),
        ]);
      })
      .then(values => {
        const [unmountPromiseValue, unmountValue] = values;
        expect(unmountPromiseValue).toBe(null);
        expect(unmountValue).toBe(null);
      })
  })
});

function createParcelConfig() {
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

  return parcelConfig;
}
