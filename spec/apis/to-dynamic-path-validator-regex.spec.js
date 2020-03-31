import { toDynamicPathValidatorRegex } from "../../src/applications/apps";

describe("toDynamicPathValidatorRegex", () => {
  it("Should generate correct regex for '/pathname'", () => {
    expect(toDynamicPathValidatorRegex("/pathname").test("/pathname")).toBe(
      true
    );
    expect(toDynamicPathValidatorRegex("/pathname").test("/pathname/")).toBe(
      true
    );
  });

  it("Should generate correct regex for '/pathname/'", () => {
    expect(toDynamicPathValidatorRegex("/pathname").test("/pathname")).toBe(
      true
    );
    expect(toDynamicPathValidatorRegex("/pathname").test("/pathname/")).toBe(
      true
    );
  });

  it("Should generate correct regex for '/#/pathname'", () => {
    expect(toDynamicPathValidatorRegex("/#/pathname").test("/#/pathname")).toBe(
      true
    );
    expect(
      toDynamicPathValidatorRegex("/#/pathname").test("/#/pathname/")
    ).toBe(true);
  });

  it("Should generate correct regex for '/#/pathname/'", () => {
    expect(toDynamicPathValidatorRegex("/#/pathname").test("/#/pathname")).toBe(
      true
    );
    expect(
      toDynamicPathValidatorRegex("/#/pathname").test("/#/pathname/")
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
        "/#/pathname//notDynamic/"
      )
    ).toBe(false);
  });

  it("Should generate correct regex for '/#/pathname/:dynamic/notDynamic/'", () => {
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
        "/#/pathname//notDynamic/"
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
        "/pathname/1/notDynamic/"
      )
    ).toBe(true);
    expect(
      toDynamicPathValidatorRegex("/pathname/:dynamic/notDynamic").test(
        "/pathname//notDynamic/"
      )
    ).toBe(false);
  });

  it("Should generate correct regex for '/pathname/:dynamic/notDynamic/'", () => {
    expect(
      toDynamicPathValidatorRegex("/pathname/:dynamic/notDynamic").test(
        "/pathname/1/notDynamic"
      )
    ).toBe(true);
    expect(
      toDynamicPathValidatorRegex("/pathname/:dynamic/notDynamic").test(
        "/pathname/1/notDynamic/"
      )
    ).toBe(true);
    expect(
      toDynamicPathValidatorRegex("/pathname/:dynamic/notDynamic").test(
        "/pathname//notDynamic/"
      )
    ).toBe(false);
  });

  it("Should generate correct regex for ''", () => {
    expect(toDynamicPathValidatorRegex("").test("")).toBe(true);
    expect(toDynamicPathValidatorRegex("").test("/")).toBe(true);
  });

  it("Should generate correct regex for '/'", () => {
    expect(toDynamicPathValidatorRegex("").test("")).toBe(true);
    expect(toDynamicPathValidatorRegex("").test("/")).toBe(true);
  });

  it("Should generate correct regex for ':dynamic/:dynamic'", () => {
    expect(toDynamicPathValidatorRegex(":dynamic/:dynamic").test("1/1")).toBe(
      true
    );
    expect(toDynamicPathValidatorRegex(":dynamic/:dynamic").test("1/1/")).toBe(
      true
    );
  });
});
