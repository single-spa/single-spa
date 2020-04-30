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
    it("Should generate correct regex for '/pathname'", () => {
      expect(toDynamicPathValidatorRegex("/pathname").test("/pathname")).toBe(
        true
      );
      expect(toDynamicPathValidatorRegex("/pathname").test("/pathname/")).toBe(
        true
      );
      expect(
        toDynamicPathValidatorRegex("/pathname").test(
          "/pathname/anything/everything"
        )
      ).toBe(true);
    });

    it("Should generate correct regex for '/#/pathname'", () => {
      expect(
        toDynamicPathValidatorRegex("/#/pathname").test("/#/pathname")
      ).toBe(true);
      expect(
        toDynamicPathValidatorRegex("/#/pathname").test("/#/pathname/")
      ).toBe(true);
      expect(
        toDynamicPathValidatorRegex("/#/pathname").test(
          "/#/pathname/anything/everything"
        )
      ).toBe(true);
    });

    it("Should generate correct regex for '/#/pathname/:dynamic/notDynamic'", () => {
      expect(
        toDynamicPathValidatorRegex("/#/pathname/:dynamic/notDynamic").test(
          "/#/pathname/1/notDynamic"
        )
      ).toBe(true);
      expect(
        toDynamicPathValidatorRegex("/#/pathname/:dynamic/notDynamic").test(
          "/#/pathname/1/notDynamic/"
        )
      ).toBe(true);
      expect(
        toDynamicPathValidatorRegex("/#/pathname/:dynamic/notDynamic").test(
          "/#/pathname//notDynamic/anything/everything"
        )
      ).toBe(false);
    });

    it("Should generate correct regex for '/pathname/:dynamic/notDynamic'", () => {
      expect(
        toDynamicPathValidatorRegex("/pathname/:dynamic/notDynamic").test(
          "/pathname/1/notDynamic"
        )
      ).toBe(true);
      expect(
        toDynamicPathValidatorRegex("/pathname/:dynamic/notDynamic").test(
          "/pathname/1/notDynamic/anything/everything"
        )
      ).toBe(true);
      expect(
        toDynamicPathValidatorRegex("/pathname/:dynamic/notDynamic").test(
          "/pathname//notDynamic"
        )
      ).toBe(false);
    });

    it("Should generate correct regex for ''", () => {
      expect(toDynamicPathValidatorRegex("").test("")).toBe(true);
      expect(toDynamicPathValidatorRegex("").test("/")).toBe(true);
      expect(toDynamicPathValidatorRegex("").test("/anything/everything")).toBe(
        true
      );
    });

    it("Should generate correct regex for '/'", () => {
      expect(toDynamicPathValidatorRegex("").test("")).toBe(true);
      expect(toDynamicPathValidatorRegex("").test("/")).toBe(true);
      expect(toDynamicPathValidatorRegex("").test("/anything/everything")).toBe(
        true
      );
    });

    it("Should generate correct regex for ':dynamic/:dynamic'", () => {
      expect(toDynamicPathValidatorRegex(":dynamic/:dynamic").test("1/1")).toBe(
        true
      );
      expect(
        toDynamicPathValidatorRegex(":dynamic/:dynamic").test("1/1/")
      ).toBe(true);
      expect(
        toDynamicPathValidatorRegex(
          ":dynamic/:dynamic/anything/everything"
        ).test("1/1/anything/everything")
      ).toBe(true);
      expect(toDynamicPathValidatorRegex(":dynamic/:dynamic").test("1//")).toBe(
        false
      );
      expect(toDynamicPathValidatorRegex(":dynamic/:dynamic").test("1/")).toBe(
        false
      );
      expect(toDynamicPathValidatorRegex(":dynamic/:dynamic").test("1")).toBe(
        false
      );
    });

    it("Should generate correct regex for '$🎉/:dynamic$🎉'", () => {
      expect(toDynamicPathValidatorRegex("$🎉/:dynamic$🎉").test("$🎉/1")).toBe(
        true
      );
      expect(
        toDynamicPathValidatorRegex("$🎉/:dynamic$🎉").test("$🎉/1/")
      ).toBe(true);
      expect(
        toDynamicPathValidatorRegex("$🎉/:dynamic$🎉").test(
          "$🎉/1/anything/everything"
        )
      ).toBe(true);
    });

    it("Should generate correct regex for 'pathname#/subpath/:dynamic'", () => {
      expect(
        toDynamicPathValidatorRegex("pathname#/subpath/:dynamic").test(
          "pathname#/subpath/1/with/other/things"
        )
      ).toBe(true);
      expect(
        toDynamicPathValidatorRegex("pathname#/subpath/:dynamic").test(
          "#/subpath/1/with/other/things"
        )
      ).toBe(false);
    });
  });
});
