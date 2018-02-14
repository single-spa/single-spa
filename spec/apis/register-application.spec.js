import * as singleSpa from 'single-spa';

describe('registerApplication', function() {
  let app
  beforeEach(() => {
    app = {
      mount(){
        return Promise.resolve()
      },
      unmount() {
        return Promise.resolve()
      },
      bootstrap() {
        return Promise.resolve()
      }
    }
  })

  describe(`Application name errors`, () => {
    it(`should throw an error if the name isn't a non empty string`, () => {
      expect(
        () => {
          singleSpa.registerApplication(app)
        }
      ).toThrowError(`The first argument must be a non-empty string 'appName'`)
      expect(
        () => {
          singleSpa.registerApplication('')
        }
      ).toThrowError(`The first argument must be a non-empty string 'appName'`)
    })

    it('should throw when I register the same application name twice', () => {
      singleSpa.registerApplication('duplicateApp', app, () => true)
      expect(
        () => {
          singleSpa.registerApplication('duplicateApp', app, () => true)
        }
      ).toThrowError('There is already an app declared with name duplicateApp')
    })

  })

  describe(`application or loading function errors`, () => {
    it(`should throw an error when I attempt to register an application without the application or loading function`, () => {
      expect(
        () => {
          singleSpa.registerApplication('no-app-will-throw-error-app')
        }
      ).toThrowError('The application or loading function is required')
    })
  })

  describe(`activity function errors`, () => {
    it(`should throw an error when I attempt to register an application without the activity function`, () => {
      expect(
        () => {
          singleSpa.registerApplication('no-loading-fn-will-throw-error-app', app)
        }
      ).toThrowError(`The activeWhen argument must be a function`)
    })

    it(`should throw an error when the activity Function isn't a function`, () => {
      expect(
        () => {
          singleSpa.registerApplication('bad-loading-fn-will-throw-error-app', app, app)
        }
      ).toThrowError(`The activeWhen argument must be a function`)
    })

  })

  describe(`custom prop errors`, () => {
    it('should throw when I pass in a function for custom props', () => {
      expect(
        () => {
          singleSpa.registerApplication('bad-custom-props-will-throw-error-app', app, () => true, () => {})
        }
      ).toThrowError('customProps must be an object')
    })

    it('should throw when I pass in an array for custom props', () => {
      expect(
        () => {
          singleSpa.registerApplication('bad-custom-props-will-throw-error-app', app, () => true, [])
        }
      ).toThrowError('customProps must be an object')
    })
  })

})
