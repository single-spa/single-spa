import { pathToActiveWhen } from "single-spa";
import { toDynamicPathValidatorRegex } from "../../src/applications/apps";

describe(`pathToActiveWhen`, () => {
  describe("Validate URL on given activeWhen pathname/hashPathname/both", () => {
    expectPathToMatch("/pathname", {
      "http://app.com/pathname": true,
      "http://app.com/pathname?query-string=1": true,
      "http://app.com/pathname#url-fragment": true,
      "http://app.com/pathname/": true,
      "http://app.com/pathname/?query-string=1": true,
      "http://app.com/pathname/anything/everything": true,
      "http://app.com/pathname/anything/everything?query-string=1": true,
      "http://app.com/pathnameExtraShouldNotMatch": false,
      "http://app.com/pathnameExtraShouldNotMatch?query-string=1": false,
    });

    expectPathToMatch("/pathname/", {
      "http://app.com/pathname/": true,
      "http://app.com/pathname/?query-string=1": true,
      "http://app.com/pathname/#url-fragment": true,
      "http://app.com/pathname/extra": true,
      "http://app.com/pathname": false,
      "http://app.com/pathname?query-string=1": false,
    });

    expectPathToMatch("/pathname/:dynamic/", {
      "http://app.com/pathname/123/": true,
      "http://app.com/pathname/123/?query-string=1": true,
      "http://app.com/pathname/123/extra": true,
      "http://app.com/pathname/123/extra?query-string=1": true,
      "http://app.com/pathname/123": false,
      "http://app.com/pathname/123?query-string=1": false,
    });

    expectPathToMatch("/#/pathname", {
      "http://app.com/#/pathname": true,
      "http://app.com/#/pathname?query-string=1": true,
      "http://app.com/#/pathname/": true,
      "http://app.com/#/pathname/?query-string=1": true,
      "http://app.com/#/pathname/anything/everything": true,
      "http://app.com/#/pathname/anything/everything#url-fragment": true,
      "http://app.com/#/pathname/anything/everything?query-string=1": true,
      "http://app.com?query-string=1/#/pathname/anything/everything?query-string=1": true,
      "http://app.com?query-string=1#/pathname/anything/everything?query-string=1": true,
    });

    expectPathToMatch("/#/pathname/:dynamic/notDynamic", {
      "http://app.com/#/pathname/1/notDynamic": true,
      "http://app.com/#/pathname/1/notDynamic/": true,
      "http://app.com/#/pathname/1/notDynamicExtra": false,
      "http://app.com/#/pathname//notDynamic/anything/everything": false,
    });

    expectPathToMatch("/pathname/:dynamic/notDynamic", {
      "http://app.com/pathname/1/notDynamic": true,
      "http://app.com/pathname/1/notDynamic/anything/everything": true,
      "http://app.com/pathname//notDynamic": false,
    });

    expectPathToMatch("", {
      "http://app.com": true,
      "http://app.com/": true,
      "http://app.com/anything/everything": true,
    });

    expectPathToMatch("/", {
      "http://app.com/": true,
      "http://app.com": true,
      "http://app.com/anything/everything": true,
    });

    expectPathToMatch("/:dynamic/:dynamic", {
      "http://app.com/1/1": true,
      "http://app.com/1/1/": true,
      "http://app.com/1//": false,
      "http://app.com/1/": false,
      "http://app.com/1": false,
    });

    expectPathToMatch("/:dynamic/:dynamic/anything/everything", {
      "http://app.com/1/1/anything/everything": true,
    });

    expectPathToMatch("/pathname#/subpath/:dynamic", {
      "http://app.com/pathname#/subpath/1/with/other/things": true,
      "http://app.com/#/subpath/1/with/other/things": false,
    });

    expectPathToMatch("/#/subpath/:dynamic", {
      "http://app.com/#/subpath/1/with/other/things": true,
      "http://app.com/#/subpath/1": true,
      "http://app.com/subpath/1/with/other/things": false,
    });

    expectPathToMatch("#/subpath/:dynamic", {
      "http://app.com#/subpath/1/with/other/things": true,
      "http://app.com#/subpath/1": true,
      "http://app.com/#/subpath/1": true,
    });

    expectPathToMatch("pathname", {
      "http://app.com/pathname": true,
      "http://app.com/pathname/bleus": true,
    });

    expectPathToMatch(":dynamic/:dynamic", {
      "http://app.com/1/1": true,
    });
  });
});

function expectPathToMatch(dynamicPath, asserts) {
  const print = (path) => (path === "" ? "empty string ('')" : path);
  Object.entries(asserts).forEach(([path, expectTo]) => {
    it(`expects path ${print(dynamicPath)} to${
      expectTo ? "" : " not"
    } match ${print(path)}`, () => {
      expect(pathToActiveWhen(dynamicPath)(new URL(path))).toBe(expectTo);
    });
  });
}
