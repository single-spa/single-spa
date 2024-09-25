import {
  NOT_MOUNTED,
  UNLOADING,
  NOT_LOADED,
  LOAD_ERROR,
  SKIP_BECAUSE_BROKEN,
  toName,
  InternalApplication,
} from "../applications/app.helpers";
import { handleAppError } from "../applications/app-errors";
import { reasonableTime } from "../applications/timeouts";
import { addProfileEntry } from "../devtools/profiler";
import { LoadedApp } from "./lifecycle.helpers";

interface UnloadInfo {
  app: InternalApplication;
  promise?: Promise<any>;
  resolve: (val?) => void;
  reject: (val?) => void;
}

const appsToUnload: Record<string, UnloadInfo> = {};

export function toUnloadPromise(app: LoadedApp): Promise<LoadedApp> {
  return Promise.resolve().then(() => {
    const unloadInfo = appsToUnload[toName(app)];

    if (!unloadInfo) {
      /* No one has called unloadApplication for this app,
       */
      return app;
    }

    if (app.status === NOT_LOADED) {
      /* This app is already unloaded. We just need to clean up
       * anything that still thinks we need to unload the app.
       */
      finishUnloadingApp(app, unloadInfo);
      return app;
    }

    if (app.status === UNLOADING) {
      /* Both unloadApplication and reroute want to unload this app.
       * It only needs to be done once, though.
       */
      return unloadInfo.promise!.then(() => app);
    }

    if (
      app.status !== NOT_MOUNTED &&
      app.status !== LOAD_ERROR
      // app.status !== SKIP_BECAUSE_BROKEN
    ) {
      /* The app cannot be unloaded unless in certain statuses
       */
      return app;
    }

    let startTime: number;

    if (__PROFILE__) {
      startTime = performance.now();
    }

    const unloadPromise =
      app.status === LOAD_ERROR || SKIP_BECAUSE_BROKEN
        ? Promise.resolve()
        : reasonableTime(app, "unload");

    app.status = UNLOADING;

    return unloadPromise
      .then(() => {
        if (__PROFILE__) {
          addProfileEntry(
            "application",
            toName(app),
            "unload",
            startTime,
            performance.now(),
            true
          );
        }

        finishUnloadingApp(app, unloadInfo);

        return app;
      })
      .catch((err) => {
        if (__PROFILE__) {
          addProfileEntry(
            "application",
            toName(app),
            "unload",
            startTime,
            performance.now(),
            false
          );
        }

        errorUnloadingApp(app, unloadInfo, err);

        return app;
      });
  });
}

function finishUnloadingApp(app: LoadedApp, unloadInfo: UnloadInfo) {
  delete appsToUnload[toName(app)];

  // Unloaded apps don't have lifecycles
  delete app.bootstrap;
  delete app.mount;
  delete app.unmount;
  delete app.unload;

  app.status = NOT_LOADED;

  /* resolve the promise of whoever called unloadApplication.
   * This should be done after all other cleanup/bookkeeping
   */
  unloadInfo.resolve();
}

function errorUnloadingApp(app: LoadedApp, unloadInfo: UnloadInfo, err: Error) {
  delete appsToUnload[toName(app)];

  // Unloaded apps don't have lifecycles
  delete app.bootstrap;
  delete app.mount;
  delete app.unmount;
  delete app.unload;

  handleAppError(err, app, SKIP_BECAUSE_BROKEN);
  unloadInfo.reject(err);
}

export function addAppToUnload(
  app: InternalApplication,
  promiseGetter: () => Promise<any>,
  resolve: (val?) => any,
  reject: (val?) => any
) {
  appsToUnload[toName(app)] = { app, resolve, reject };
  Object.defineProperty(appsToUnload[toName(app)], "promise", {
    get: promiseGetter,
  });
}

export function getAppUnloadInfo(appName: string): UnloadInfo {
  return appsToUnload[appName];
}
