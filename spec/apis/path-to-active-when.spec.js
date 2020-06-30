import { pathToActiveWhen } from "single-spa";
import { toDynamicPathValidatorRegex } from "../../src/applications/apps";

describe(`pathToActiveWhen`, () => {
  it(`allows you to create your own activeWhen functions using the single-spa public api`, () => {
    const activeWhen = pathToActiveWhen("/users/:userId/settings");

    expect(activeWhen(new URL("http://localhost/users/1/settings"))).toBe(true);
    expect(activeWhen(new URL("http://localhost/users/1"))).toBe(false);
    expect(activeWhen(new URL("http://localhost/users"))).toBe(false);
    expect(activeWhen(new URL("http://localhost/cart"))).toBe(false);
  });

  describe("toDynamicPathValidatorRegex", () => {
    expectPathToMatch("/pathname", {
      "/pathname": true,
      "/pathname/": true,
      "/pathname/anything/everything": true,
      "/pathnameExtraShouldNotMatch": false,
      // "/pathname?query-string=1": true,
      // "/pathname/?query-string=1": true,
    });

    expectPathToMatch("/pathname/", {
      "/pathname": false,
      "/pathname/": true,
      "/pathname/extra": true,
      // "/pathname?query-string=1": false,
      // "/pathname/?query-string=1": true,
      // "/pathname/extra?query-string=1": true,
    });

    expectPathToMatch("/pathname/:dynamic/", {
      "/pathname/123": false,
      "/pathname/123/": true,
      "/pathname/123/extra": true,
    });

    expectPathToMatch("/#/pathname", {
      "/#/pathname": true,
      "/#/pathname/": true,
      "/#/pathname/anything/everything": true,
    });

    expectPathToMatch("/#/pathname/:dynamic/notDynamic", {
      "/#/pathname/1/notDynamic": true,
      "/#/pathname/1/notDynamicExtra": false,
      "/#/pathname/1/notDynamic/": true,
      "/#/pathname//notDynamic/anything/everything": false,
    });

    expectPathToMatch("/pathname/:dynamic/notDynamic", {
      "/pathname/1/notDynamic": true,
      "/pathname/1/notDynamic/anything/everything": true,
      "/pathname//notDynamic": false,
    });

    expectPathToMatch("", {
      "": true,
      "/": true,
      "/anything/everything": true,
    });

    expectPathToMatch("/", {
      "": false,
      "/": true,
      "/anything/everything": true,
    });

    expectPathToMatch(":dynamic/:dynamic", {
      "1/1": true,
      "1/1/": true,
      "1//": false,
      "1/": false,
      "1": false,
    });

    expectPathToMatch(":dynamic/:dynamic/anything/everything", {
      "1/1/anything/everything": true,
    });

    expectPathToMatch("$🎉/:dynamic$🎉", {
      "$🎉/1": true,
      "$🎉/1/": true,
      "$🎉/1/anything/everything": true,
    });

    expectPathToMatch("pathname#/subpath/:dynamic", {
      "pathname#/subpath/1/with/other/things": true,
      "#/subpath/1/with/other/things": false,
    });
  });
});

function expectPathToMatch(dynamicPath, asserts) {
  const print = (path) => (path === "" ? "empty string ('')" : path);
  Object.entries(asserts).forEach(([path, expectTo]) => {
    it(`expects dynamicPath ${print(dynamicPath)} to ${
      expectTo ? "" : "not"
    } match ${print(path)}`, () => {
      expect(toDynamicPathValidatorRegex(dynamicPath).test(path)).toBe(
        expectTo
      );
    });
  });
}
