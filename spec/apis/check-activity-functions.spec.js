import * as singleSpa from "single-spa";

const dummyApp1 = {
  bootstrap() {
    return Promise.resolve();
  },
  mount() {
    return Promise.resolve();
  },
  unmount() {
    return Promise.resolve();
  },
  unload() {
    return Promise.resolve();
  }
};

const dummyApp2 = {
  bootstrap() {
    return Promise.resolve();
  },
  mount() {
    return Promise.resolve();
  },
  unmount() {
    return Promise.resolve();
  },
  unload() {
    return Promise.resolve();
  }
};

const dummyApp3 = {
  bootstrap() {
    return Promise.resolve();
  },
  mount() {
    return Promise.resolve();
  },
  unmount() {
    return Promise.resolve();
  },
  unload() {
    return Promise.resolve();
  }
};

const activityFunctions = {
  1: activityFunction1,
  2: activityFunction2,
  3: activityFunction3
};

describe(`checkActivityFunctionsApi`, () => {
  beforeAll(() => {
    singleSpa.registerApplication(
      "test1",
      () => Promise.resolve(dummyApp1),
      activityFunctions[1]
    );
    singleSpa.registerApplication(
      "test2",
      () => Promise.resolve(dummyApp2),
      activityFunctions[2]
    );
    singleSpa.registerApplication({
      name: "test3",
      app: Promise.resolve(dummyApp3),
      activeWhen: activityFunctions[3]
    });
  });

  beforeEach(() => {
    jest.spyOn(activityFunctions, 1);
    jest.spyOn(activityFunctions, 2);
    jest.spyOn(activityFunctions, 3);
  });

  it(`returns 'test1' when the locationContains 'one'`, () => {
    const wLocation = mockWindowLocation("google.com/one");
    expect(singleSpa.checkActivityFunctions(wLocation)).toEqual(["test1"]);
  });

  it(`returns 'test2' when the locationContains 'two'`, () => {
    const wLocation = mockWindowLocation("google.com/two");
    expect(singleSpa.checkActivityFunctions(wLocation)).toEqual(["test2"]);
  });

  it(`returns 'test3' when the locationContains 'three'`, () => {
    const wLocation = mockWindowLocation("google.com/three");
    expect(singleSpa.checkActivityFunctions(wLocation)).toEqual(["test3"]);
  });

  it(`returns both when the locationContains all`, () => {
    const wLocation = mockWindowLocation("something.com/two/one/three");
    expect(singleSpa.checkActivityFunctions(wLocation)).toEqual([
      "test1",
      "test2",
      "test3"
    ]);
  });
});

function activityFunction1(location) {
  return location.href.indexOf("one") !== -1;
}

function activityFunction2(location) {
  return location.href.indexOf("two") !== -1;
}

function activityFunction3(location) {
  return location.href.indexOf("three") !== -1;
}

function mockWindowLocation(url) {
  return {
    href: url
  };
}
