import { find } from "../utils/find.js";
import { objectType, toName } from "../applications/app.helpers.js";
import { formatErrorMessage } from "../applications/app-errors.js";
import { AppOrParcelStatus } from "../applications/app.helpers";

export function validLifecycleFn(fn) {
  return fn && (typeof fn === "function" || isArrayOfFns(fn));

  function isArrayOfFns(arr) {
    return (
      Array.isArray(arr) && !find(arr, (item) => typeof item !== "function")
    );
  }
}

export function flattenFnArray(appOrParcel, lifecycle) {
  let fns = appOrParcel[lifecycle] || [];
  fns = Array.isArray(fns) ? fns : [fns];
  if (fns.length === 0) {
    fns = [() => Promise.resolve()];
  }

  const type = objectType(appOrParcel);
  const name = toName(appOrParcel);

  return function (props) {
    return fns.reduce((resultPromise, fn, index) => {
      return resultPromise.then(() => {
        const thisPromise = fn(props);
        return smellsLikeAPromise(thisPromise)
          ? thisPromise
          : Promise.reject(
              formatErrorMessage(
                15,
                __DEV__ &&
                  `Within ${type} ${name}, the lifecycle function ${lifecycle} at array index ${index} did not return a promise`,
                type,
                name,
                lifecycle,
                index
              )
            );
      });
    }, Promise.resolve());
  };
}

export function smellsLikeAPromise(promise) {
  return (
    promise &&
    typeof promise.then === "function" &&
    typeof promise.catch === "function"
  );
}

export interface CustomProps {
  [str: string]: any;
  [num: number]: any;
}

export interface ParcelCustomProps extends CustomProps {
  domElement: HTMLElement;
}

type CustomPropsFn<ExtraProps extends CustomProps = CustomProps> = (
  name: string,
  location: Location
) => ExtraProps;

export type AppProps = {
  name: string;
  singleSpa: any;
  mountParcel(
    parcelConfig: ParcelConfig,
    customProps: ParcelProps & CustomProps
  ): Parcel;
};

export type ParcelConfig<ExtraProps = CustomProps> =
  | ParcelConfigObject<ExtraProps>
  | (() => Promise<ParcelConfigObject<ExtraProps>>);

type ParcelProps = { domElement: HTMLElement };
export type ParcelConfigObject<ExtraProps = CustomProps> = {
  name?: string;
  timeouts: AppOrParcelTimeouts;
} & LifeCycles<ExtraProps>;

type LifeCycleFn<ExtraProps> = (config: ExtraProps & AppProps) => Promise<any>;
export type LifeCycles<ExtraProps = {}> = {
  bootstrap: LifeCycleFn<ExtraProps> | Array<LifeCycleFn<ExtraProps>>;
  mount: LifeCycleFn<ExtraProps> | Array<LifeCycleFn<ExtraProps>>;
  unmount: LifeCycleFn<ExtraProps> | Array<LifeCycleFn<ExtraProps>>;
  update?: LifeCycleFn<ExtraProps> | Array<LifeCycleFn<ExtraProps>>;
};

export type Parcel<ExtraProps = CustomProps> = {
  mount(): Promise<null>;
  unmount(): Promise<null>;
  update?(customProps: ExtraProps): Promise<any>;
  getStatus(): AppOrParcelStatus;
  loadPromise: Promise<null>;
  bootstrapPromise: Promise<null>;
  mountPromise: Promise<null>;
  unmountPromise: Promise<null>;
  // Intended for internal use only
  _parcel: InternalParcel;
};

export interface ParcelOwner {
  name: string;
  parcels: ParcelMap;
}

export interface ParcelMap {
  [parcelId: number]: InternalParcel;
}

interface AppOrParcelTimeouts {
  bootstrap: Timeout;
  mount: Timeout;
  unmount: Timeout;
  unload: Timeout;
  update: Timeout;
}

interface Timeout {
  millis: number;
  dieOnTimeout: false;
  warningMillis: number;
}

// Intended for internal use only
export interface InternalParcel {
  id: number;
  name: string;
  bootstrap: LifeCycles["bootstrap"];
  mount: LifeCycles["mount"];
  unmount: LifeCycles["unmount"];
  update: LifeCycles["update"];
  parcels: ParcelMap;
  status: AppOrParcelStatus;
  customProps: CustomProps;
  parentName: string;
  unmountThisParcel(): Promise<AppOrParcel>;
  timeouts: AppOrParcelTimeouts;
}

export type AppOrParcel = ApplicationObject | Parcel;

export type ApplicationObject<ExtraProps = {}> = LifeCycles<ExtraProps> &
  ParcelOwner;

export type Application<ExtraProps = {}> =
  | LifeCycles<ExtraProps>
  | ((config: ExtraProps & AppProps) => Promise<LifeCycles<ExtraProps>>);

export type ActivityFn = (location: Location) => boolean;

export type Activity = ActivityFn | string | (ActivityFn | string)[];

export type RegisterApplicationConfig<ExtraProps extends CustomProps = {}> = {
  name: string;
  app: Application<ExtraProps>;
  activeWhen: Activity;
  customProps?: ExtraProps | CustomPropsFn<ExtraProps>;
};
