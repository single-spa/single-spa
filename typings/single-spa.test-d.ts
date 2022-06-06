import "..";
import {
  mountRootParcel,
  registerApplication,
  pathToActiveWhen,
  SingleSpaCustomEventDetail,
  SingleSpaNewAppStatus,
  SingleSpaAppsByNewStatus,
  Parcel,
  ParcelConfig,
  setBootstrapMaxTime,
  setMountMaxTime,
  setUnmountMaxTime,
} from "single-spa";
import { expectError, expectType } from "tsd";

const planetsParcel: ParcelConfig<Planets> = {
  async bootstrap() {},
  async mount() {},
  async unmount() {},
};

const appOrParcel = {
  async bootstrap() {},
  async mount() {},
  async unmount() {},
};

mountRootParcel(appOrParcel, {
  hi: "there",
  domElement: document.createElement("div"),
});

interface Planets {
  favoritePlanet: string;
}

const parcel: Parcel<Planets> = mountRootParcel<Planets>(appOrParcel, {
  domElement: document.createElement("div"),
  favoritePlanet: "Mercury",
});
if (parcel.update) {
  parcel.update({
    favoritePlanet: "Mars",
  });
}

expectError(
  mountRootParcel<Planets>(appOrParcel, () => {})
);

registerApplication({
  name: "app1",
  activeWhen: "/",
  app: appOrParcel,
  customProps: {
    hi: "there",
  },
});

registerApplication({
  name: "app1",
  activeWhen: "/",
  app: appOrParcel,
  customProps: (name: string, location: Location) => ({
    hi: "there",
  }),
});

const activeWhen = pathToActiveWhen("/users/:id");
expectType<boolean>(activeWhen(window.location));

const activeWhenExact = pathToActiveWhen("/users/:id", true);
expectType<boolean>(activeWhenExact(window.location));

window.addEventListener("single-spa:routing-event", ((
  evt: CustomEvent<SingleSpaCustomEventDetail>
) => {
  expectType<SingleSpaCustomEventDetail>(evt.detail);
  expectType<SingleSpaNewAppStatus>(evt.detail.newAppStatuses);
  expectType<SingleSpaAppsByNewStatus>(evt.detail.appsByNewStatus);
  expectType<number>(evt.detail.totalAppChanges);
  expectType<Event | undefined>(evt.detail.originalEvent);
  expectType<string>(evt.detail.oldUrl);
  expectType<string>(evt.detail.newUrl);
  expectType<boolean>(evt.detail.navigationIsCanceled);
  expectType<(() => void) | undefined>(evt.detail.cancelNavigation);
}) as EventListener);

setBootstrapMaxTime(100);
setBootstrapMaxTime(100, true);
setBootstrapMaxTime(100, true, 50);

setMountMaxTime(100);
setMountMaxTime(100, true);
setMountMaxTime(100, true, 50);

setUnmountMaxTime(100);
setUnmountMaxTime(100, true);
setUnmountMaxTime(100, true, 50);
