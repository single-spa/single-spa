let profileEntries = [];

export function getProfilerData() {
  return profileEntries;
}

/**
 *
 * @type {'application' | 'parcel' | 'routing'} ProfileType
 *
 * @param {ProfileType} type
 * @param {String} name
 * @param {number} start
 * @param {number} end
 */
export function addProfileEntry(
  type,
  name,
  kind,
  start,
  end,
  operationSucceeded
) {
  profileEntries.push({
    type,
    name,
    start,
    end,
    kind,
    operationSucceeded,
  });
}

export function clearProfilerData() {
  profileEntries = [];
}
