export default function checkActivityFunctionsApi() {

  const dummyApp1 = {
    bootstrap() {return Promise.resolve()},
    mount() {return Promise.resolve()},
    unmount() {return Promise.resolve()},
    unload() {return Promise.resolve()},
  };

  const dummyApp2 = {
    bootstrap() {return Promise.resolve()},
    mount() {return Promise.resolve()},
    unmount() {return Promise.resolve()},
    unload() {return Promise.resolve()},
  };

  const activityFunctions = {
    1: activityFunction1,
    2: activityFunction2
  }

  describe(`checkActivityFunctionsApi`, () => {

    beforeAll(() => {
      singleSpa.registerApplication('test1', () => Promise.resolve(dummyApp1), activityFunctions[1])
      singleSpa.registerApplication('test2', () => Promise.resolve(dummyApp2), activityFunctions[2])
    })

    beforeEach(() => {
      spyOn(activityFunctions, 1).and.callThrough()
      spyOn(activityFunctions, 2).and.callThrough()
    })

    it(`returns 'test1' when the locationContains 'one'`, () => {
      const wLocation = mockWindowLocation('google.com/one')
      expect(singleSpa.checkActivityFunctions(wLocation)).toEqual(['test1'])
    })

    it(`returns 'test2' when the locationContains 'two'`, () => {
      const wLocation = mockWindowLocation('google.com/two')
      expect(singleSpa.checkActivityFunctions(wLocation)).toEqual(['test2'])
    })

    it(`returns both when the locationContains both`, () => {
      const wLocation = mockWindowLocation('something.com/two/one')
      expect(singleSpa.checkActivityFunctions(wLocation)).toEqual(['test1', 'test2'])
    })
  })

}

function activityFunction1 (location) {
  return location.href.indexOf('one') !== -1
}

function activityFunction2 (location) {
  return location.href.indexOf('two') !== -1
}

function mockWindowLocation (url) {
  return {
    href: url
  }
}
