import {getRawAppData} from '../applications/apps'
import { reroute } from '../navigation/reroute';

export const getAppData = getRawAppData
export const forceMount = forceMountUnmount.bind(null, true)
export const forceUnmount = forceMountUnmount.bind(null, false)

export function revertForceMountUnmount(appName) {
  const app = getRawAppData().find(rawapp => rawapp.name === appName)
  if(app[activeWhenBackup]) {
    app.activeWhen = app[activeWhenBackup]
    delete app[activeWhenBackup]
    delete app.__activeWhenOverride__
  }
  reroute()
}

// as much as possible, we try to avoid putting anything on the app object that could potenetially confict. Symbols to the resuce!
const activeWhenBackup = Symbol("activeWhenBackup")
function forceMountUnmount(shouldMount, appName) {
  const app = getRawAppData().find(rawapp => rawapp.name === appName)
  if(!app[activeWhenBackup]) {
    // only set the backup when there isn't one already. otherwise you could potentilaly overwrite it with "always on" or "always off"
    app[activeWhenBackup] = app.activeWhen
  }
  // don't use a symbol for __activeWhenOverride__ because it needs to be read in the context of devtools, which means it's JSON.string-ified and Symbols don't survive that
  app.__activeWhenOverride__ = shouldMount ? "on" : "off"
  app.activeWhen = () => shouldMount
  reroute()
}