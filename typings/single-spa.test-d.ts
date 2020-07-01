import "..";
import {
  mountRootParcel,
  registerApplication,
  pathToActiveWhen,
} from "single-spa";
import { expectType } from "tsd";

const appOrParcel = {
  async bootstrap() {},
  async mount() {},
  async unmount() {},
};

mountRootParcel(appOrParcel, {
  hi: "there",
  domElement: document.createElement("div"),
});

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
