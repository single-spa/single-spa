# Parcel API
Most parcel methods will be called on the parcel itself, with the excpetion being around mounting.

## mounting
Both mount methods return a [parcel object]('/docs/parcel-api.md#parcelobject'). The parcel object contains all additional exposed methods.
### mountParcel
`application.mountParcel(parcelConfig)`. Each application is provided a mountParcel function.
The main advantage to using an applications `mountParcel` function is that parcels mounted via an 
applications `mountParcel` will be automatically unmounted when the application is unmounted.

### mountRootParcel
The [mountRootParcel](/docs/single-spa-api.md#mountrootparcel) method will mount the parcel but `unmount` must be called manually.

## Parcel Object
The parcel object is the external representation of a single-spa parcel. It contains the following functions and methods
- [mount]()
- [unmount]()
- [getStatus]()
- [loadPromise]()
- [bootstrapPromise]()
- [mountPromise]()
- [unmountPromise]()

### unmount
`parcel.unmount()` returns a promise that resolves once the parcel is successfully unmounted. The promise may throw an error which needs to be handled.

### mount
`parcel.mount()` returns a promise that resolves once the parcel is successfully mounted. The promise can throw an error which needs to be handled.

### getStatus
`parcel.getStatus()` retuns a string of that parcels status. The string status is one of the following:
- `NOT_BOOTSTRAPPED`: The parcel has not been bootstrapped
- `BOOTSTRAPPING`: The parcel is bootstrapping but has not finished
- `NOT_MOUNTED`: The parcel has bootstrapped, but is not mounted
- `MOUNTED`: The parcel is currently active and mounted to the DOM
- `UNMOUNTING`: The parcel is unmounting, but has not finished
- `UPDATING`: The parcel is currently being updated, but has not finished
- `SKIP_BECAUSE_BROKEN`: The parcel threw an error during bootstrap, mount, unmount, or update. Other parcels may continue normally, but this one will be skipped.

### loadPromise
`parcel.loadPromise()` returns a promise that will resolve once the parcel has been loaded.

### bootstrapPromise
`parcel.bootstrapPromise()` returns a promise that will resolve once the parcel has been bootstrapped.

### mountPromise
`parcel.mountPromise()` returns a promise that will resolve once the parcel has been mounted. This is helpful for knowing exactly when a parcel has been appended to the DOM

### unmountPromise
`parcel.unmountPromise()` returns a promise that will resolve once the parcel has been unmounted.
