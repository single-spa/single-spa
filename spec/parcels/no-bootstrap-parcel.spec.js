import * as singleSpa from "single-spa";

describe(`parcels without bootstrap lifecycle`, () => {
  it(`can mount a parcel missing the bootstrap lifecycle`, async () => {
    const parcelConfig = { async mount() {}, async unmount() {} };
    const parcel = singleSpa.mountRootParcel(parcelConfig, {
      domElement: document.createElement("div"),
    });
    await parcel.mountPromise;
  });
});
