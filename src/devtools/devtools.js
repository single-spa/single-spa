import {getRawAppData} from '../applications/apps'
import {reroute} from '../navigation/reroute'
import {NOT_LOADED} from '../applications/app.helpers'
import {toLoadPromise} from '../lifecycles/load'
import {toBootstrapPromise} from '../lifecycles/bootstrap'

export const getAppData = getRawAppData
export const forceMount = forceMountUnmount.bind(null, true)
export const forceUnmount = forceMountUnmount.bind(null, false)

export function revertForceMountUnmount(appName) {
  const app = getRawAppData().find(rawapp => rawapp.name === appName)
  if(app.devtools.activeWhenBackup) {
    app.activeWhen = app.devtools.activeWhenBackup
    delete app.devtools.activeWhenBackup
    delete app.devtools.activeWhenForced
  }
  reroute()
}

function forceMountUnmount(shouldMount, appName) {
  const app = getRawAppData().find(rawapp => rawapp.name === appName)

  if(!app.devtools.activeWhenBackup) {
    // only set the backup when there isn't one already. otherwise you could potentilaly overwrite it with "always on" or "always off"
    app.devtools.activeWhenBackup = app.activeWhen
  }

  app.devtools.activeWhenForced = shouldMount ? "on" : "off"
  app.activeWhen = () => shouldMount

  if(shouldMount && app.status === NOT_LOADED) {
    // we can't mount a NOT_LOADED app, so let's load and bootstrap it first
    toLoadPromise(app)
    .then(() => toBootstrapPromise(app))
    .then(() => reroute())
    .catch(err => {
      console.error(`Something failed in the process of loading and bootstrapping your force mounted app (${app.name}):`, err)
      throw err
    })
  } else {
    reroute()
  }
}