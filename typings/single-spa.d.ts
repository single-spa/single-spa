declare module "single-spa" {
  // ./start.js
  export function start(): void;
  export function isStarted(): boolean;

  // ./jquery-support.js
  export function ensureJQuerySupport(jQuery?: JQuery): void;

  // ./applications/timeouts.js
  export function setBootstrapMaxTime(
    time: number,
    dieOnTimeout?: boolean
  ): void;
  export function setMountMaxTime(time: number, dieOnTimeout?: boolean): void;
  export function setUnmountMaxTime(time: number, dieOnTimeout?: boolean): void;
  export function setUnloadMaxTime(time: number, dieOnTimeout?: boolean): void;

  // ./applications/apps.js
  export function registerApplication(
    appName: string,
    applicationOrLoadingFn: Function | Promise<any>,
    activityFn: (location: Location) => boolean,
    customProps?: Object
  ): void;

  export function getMountedApps(): string[];

  export enum AppStatus {
    NOT_LOADED = "NOT_LOADED",
    LOADING_SOURCE_CODE = "LOADING_SOURCE_CODE",
    NOT_BOOTSTRAPPED = "NOT_BOOTSTRAPPED",
    BOOTSTRAPPING = "BOOTSTRAPPING",
    NOT_MOUNTED = "NOT_MOUNTED",
    MOUNTING = "MOUNTING",
    MOUNTED = "MOUNTED",
    UPDATING = "UPDATING",
    UNMOUNTING = "UNMOUNTING",
    UNLOADING = "UNLOADING",
    SKIP_BECAUSE_BROKEN = "SKIP_BECAUSE_BROKEN"
  }

  export function getAppStatus(appName: string): AppStatus | null;

  export function unloadApplication(
    appName: string,
    opts?: { waitForUnmount: boolean }
  ): Promise<any>;

  export function checkActivityFunctions(location: Location): string[];
  export function getAppNames(): string[];

  // ./navigation/navigation-events.js'
  export function navigateToUrl(
    obj:
      | string
      | {
          currentTarget: {
            href: string;
          };
          preventDefault: any;
        },
    opts?: Object
  ): void;

  // './navigation/reroute.js'
  export function triggerAppChange(): Promise<any>;

  // './applications/app-errors.js'
  export function addErrorHandler(handler: (error: Error) => void): void;
  export function removeErrorHandler(handler: (error: Error) => void): void;

  // './parcels/mount-parcel.js'
  export function mountRootParcel(parcelConfig: any, parcelProps: any): boolean;
}
