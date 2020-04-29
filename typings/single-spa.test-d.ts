import "..";
import { mountRootParcel, registerApplication } from "single-spa";

const appOrParcel = {
  async bootstrap() {},
  async mount() {},
  async unmount() {},
};

mountRootParcel(appOrParcel, {
  hi: "there",
  domElement: document.createElement("div"),
});

mountRootParcel(appOrParcel, (name: string, location: Location) => ({
  hi: "there",
  domElement: document.createElement("div"),
}));

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
