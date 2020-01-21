declare module "single-spa" {
  type Splat<T> = {
    [p in keyof T]: Array<T[p]>;
  };

  export type AppProps = {
    name: string;
    singleSpa: any;
    mountParcel(parcelConfig: ParcelConfig, customProps: object): Parcel;
  };

  export type ParcelConfig =
    | ParcelConfigObject
    | (() => Promise<ParcelConfigObject>);

  type ParcelConfigObject = {
    name?: string;
    customProps: object;
    domElement: HTMLElement;
  } & LifeCycles;

  type Parcel = {
    mount(): Promise<null>;
    unmount(): Promise<null>;
    getStatus():
      | "NOT_LOADED"
      | "LOADING_SOURCE_CODE"
      | "NOT_BOOTSTRAPPED"
      | "BOOTSTRAPPING"
      | "NOT_MOUNTED"
      | "MOUNTING"
      | "MOUNTED"
      | "UPDATING"
      | "UNMOUNTING"
      | "UNLOADING"
      | "SKIP_BECAUSE_BROKEN"
      | "LOAD_ERROR";
    loadPromise: Promise<null>;
    bootstrapPromise: Promise<null>;
    mountPromise: Promise<null>;
    unmountPromise: Promise<null>;
  };

  export type LifeCycles<T = {}> = {
    bootstrap: (config: T & AppProps) => Promise<any>;
    mount: (config: T & AppProps) => Promise<any>;
    unmount: (config: T & AppProps) => Promise<any>;
    update?: (config: T & AppProps) => Promise<any>;
  };

  // ./start.js
  export function start(): void;
  export function isStarted(): boolean;

  // ./jquery-support.js
  export function ensureJQuerySupport(jQuery?: any): void;

  // ./applications/timeouts.js
  export function setBootstrapMaxTime(
    time: number,
    dieOnTimeout?: boolean
  ): void;
  export function setMountMaxTime(time: number, dieOnTimeout?: boolean): void;
  export function setUnmountMaxTime(time: number, dieOnTimeout?: boolean): void;
  export function setUnloadMaxTime(time: number, dieOnTimeout?: boolean): void;

  // ./applications/apps.js
  export function registerApplication<T extends object = {}>(
    appName: string,
    applicationOrLoadingFn:
      | LifeCycles<T>
      | ((
          config: T & AppProps
        ) => Promise<LifeCycles<T> | Splat<LifeCycles<T>>>),
    activityFn: (location: Location) => boolean,
    customProps?: T
  ): void;

  export function getMountedApps(): string[];

  export const {
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
    SKIP_BECAUSE_BROKEN = "SKIP_BECAUSE_BROKEN",
    LOAD_ERROR = "LOAD_ERROR"
  };

  export function getAppStatus(appName: string): string | null;

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
  type AppError = Error & {
    appOrParcelName: string;
  };
  export function addErrorHandler(handler: (error: AppError) => void): void;
  export function removeErrorHandler(handler: (error: AppError) => void): void;

  // './parcels/mount-parcel.js'
  export function mountRootParcel(
    parcelConfig: ParcelConfig,
    parcelProps: object
  ): Parcel;
}
