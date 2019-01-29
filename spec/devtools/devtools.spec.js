import {removeCyclicReferences} from "../../src/devtools/devtools.helper"

describe(`devtools`, () => {
  it(`should remove cyclic references all the way down`, () => {
    const mockApps = [
      {
        name: 1,
        parcels: {
          0: {
            name: 2,
            owningAppOrParcel: "should be deleted",
            timeouts: {
              owningAppOrParcel: "should be deleted",
            },
            parcels: {
              0: {
                name: 3,
                owningAppOrParcel: "should be deleted",
                timeouts: {
                  owningAppOrParcel: "should be deleted",
                },
                parcels: {},
              }
            }
          }
        }
      },
    ]

    const cleanedApps = removeCyclicReferences(mockApps)
    expect(cleanedApps[0].parcels[0].owningAppOrParcel).toBe(undefined)
    expect(cleanedApps[0].parcels[0].timeouts.owningAppOrParcel).toBe(undefined)

    expect(cleanedApps[0].parcels[0].parcels[0].owningAppOrParcel).toBe(undefined)
    expect(cleanedApps[0].parcels[0].parcels[0].timeouts.owningAppOrParcel).toBe(undefined)
  })
})