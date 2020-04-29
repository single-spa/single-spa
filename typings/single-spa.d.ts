declare module "single-spa" {
  interface CustomProps {
    [str: string]: any;
    [num: number]: any;
  }

  type CustomPropsFn<T extends CustomProps = CustomProps> = (
    name: string,
    location: Location
  ) => T;

  export type AppProps = {
    name: string;
    singleSpa: any;
    mountParcel(
      parcelConfig: ParcelConfig,
      customProps:
        | (ParcelProps & CustomProps)
        | CustomPropsFn<ParcelProps & CustomProps>
    ): Parcel;
  };

  export type ParcelConfig =
    | ParcelConfigObject
    | (() => Promise<ParcelConfigObject>);

  type ParcelProps = { domElement: HTMLElement };
  type ParcelConfigObject = { name?: string } & LifeCycles;

  type Parcel = {
    mount(): Promise<null>;
    unmount(): Promise<null>;
    update?(customProps: CustomProps | CustomPropsFn): Promise<any>;
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

  type LifeCycleFn<T> = (config: T & AppProps) => Promise<any>;
  export type LifeCycles<T = {}> = {
    bootstrap: LifeCycleFn<T> | Array<LifeCycleFn<T>>;
    mount: LifeCycleFn<T> | Array<LifeCycleFn<T>>;
    unmount: LifeCycleFn<T> | Array<LifeCycleFn<T>>;
    update?: LifeCycleFn<T> | Array<LifeCycleFn<T>>;
  };

  export type StartOpts = {
    urlRerouteOnly?: boolean;
  };

  // ./start.js
  export function start(opts?: StartOpts): void;
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

  type Application<T = {}> =
    | LifeCycles<T>
    | ((config: T & AppProps) => Promise<LifeCycles<T>>);

  type ActivityFn = (location: Location) => boolean;

  type Activity = ActivityFn | string | (ActivityFn | string)[];

  export type RegisterApplicationConfig<T extends CustomProps = {}> = {
    name: string;
    app: Application<T>;
    activeWhen: Activity;
    customProps?: T | CustomPropsFn<T>;
  };

  // ./applications/apps.js
  export function registerApplication<T extends object = {}>(
    appName: string,
    applicationOrLoadingFn: Application<T>,
    activityFn: ActivityFn,
    customProps?: T | CustomPropsFn<T>
  ): void;

  export function registerApplication<T extends object = {}>(
    config: RegisterApplicationConfig<T>
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
    LOAD_ERROR = "LOAD_ERROR",
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
    parcelProps:
      | (ParcelProps & CustomProps)
      | CustomPropsFn<ParcelProps & CustomProps>
  ): Parcel;

  export function pathToActiveWhen(path: string): ActivityFn;
}
