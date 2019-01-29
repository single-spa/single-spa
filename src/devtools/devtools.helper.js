export function removeCyclicReferences(apps) {
  // we must get rid of cyclic references before we can return apps -- otherwise, devtools gets an error because JSON.stringify doesn't resolve cyclic references
  return apps.map(app => {
    if(Object.keys(app.parcels).length > 0) {
      app.parcels = Object.keys(app.parcels).map(parcKey => {
        return removeParcelCyclicReferences(app.parcels[parcKey])
      })
    }
    return app
  })
}

function removeParcelCyclicReferences(parcel) {
  delete parcel.owningAppOrParcel
  delete parcel.timeouts.owningAppOrParcel
  if(Object.keys(parcel.parcels).length > 0) {
    parcel.parcels = Object.keys(parcel.parcels).map(parcKey => {
      return removeParcelCyclicReferences(parcel.parcels[parcKey])
    })
  }
  return parcel
}