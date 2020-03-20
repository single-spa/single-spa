import * as singleSpa from "single-spa";

describe("registerApplication", function() {
  let app;
  let errorsMessages = {
    invalidConfig: "Configuration object can't be an Array or null!",
    name: {
      args:
        "The 1st argument to registerApplication must be a non-empty string 'appName'",
      config:
        "The config.name on registerApplication must be a non-empty string"
    },
    app: {
      args:
        "The 2nd argument to registerApplication must be an application or loading application function",
      config:
        "The config.app on registerApplication must be an application or a loading fuinction"
    },
    activeWhen: {
      args:
        "The 3rd argument to registerApplication must be an activeWhen function",
      config:
        "The config.activeWhen on registerApplication must be a string, function or an array with string/function/both"
    },
    customProps: {
      args: "The optional 4th argument is a customProps and must be an object",
      config: "The optional config.customProps must be an object"
    },
    duplicateApp: "There is already an app declared with name"
  };
  beforeEach(() => {
    app = {
      mount() {
        return Promise.resolve();
      },
      unmount() {
        return Promise.resolve();
      },
      bootstrap() {
        return Promise.resolve();
      }
    };
  });

  describe(`Application name errors`, () => {
    it(`should throw an error if the name isn't a non empty string`, () => {
      expect(() => {
        singleSpa.registerApplication(null);
      }).toThrowError(errorsMessages.name.invalidConfig);
      expect(() => {
        singleSpa.registerApplication();
      }).toThrowError(errorsMessages.name.args);
      expect(() => {
        singleSpa.registerApplication("");
      }).toThrowError(errorsMessages.name.args);
      expect(() => {
        singleSpa.registerApplication({ name: null });
      }).toThrowError(errorsMessages.name.config);
      expect(() => {
        singleSpa.registerApplication({ name: "" });
      }).toThrowError(errorsMessages.name.config);
      expect(() => {
        singleSpa.registerApplication({});
      }).toThrowError(errorsMessages.name.config);
    });

    it("should throw when I register the same application name twice", () => {
      singleSpa.registerApplication("duplicateApp", app, () => true);
      expect(() => {
        singleSpa.registerApplication({
          name: "duplicateApp",
          app,
          activeWhen: () => true
        });
      }).toThrowError(errorsMessages.duplicateApp);
    });
  });

  describe(`application or loading function errors`, () => {
    it(`should throw an error when I attempt to register an application without the application or loading function`, () => {
      expect(() => {
        singleSpa.registerApplication("no-app-will-throw-error-app");
      }).toThrowError(errorsMessages.app.args);
      expect(() => {
        singleSpa.registerApplication({ name: "no-app-will-throw-error-app" });
      }).toThrowError(errorsMessages.app.config);
    });
  });

  describe(`activity function errors`, () => {
    it(`should throw an error when I attempt to register an application without the activity function`, () => {
      expect(() => {
        singleSpa.registerApplication(
          "no-loading-fn-will-throw-error-app",
          app
        );
      }).toThrowError(errorsMessages.activeWhen.args);
      expect(() => {
        singleSpa.registerApplication({
          name: "no-loading-fn-will-throw-error-app",
          app
        });
      }).toThrowError(errorsMessages.activeWhen.config);
    });

    it(`should throw an error when the activity Function isn't a function`, () => {
      expect(() => {
        singleSpa.registerApplication(
          "bad-loading-fn-will-throw-error-app",
          app,
          app
        );
      }).toThrowError(errorsMessages.activeWhen.args);
      expect(() => {
        singleSpa.registerApplication({
          name: "bad-loading-fn-will-throw-error-app",
          app,
          activeWhen: app
        });
      }).toThrowError(errorsMessages.activeWhen.config);
    });
  });

  describe(`custom prop errors`, () => {
    it("should throw when I pass in a function for custom props", () => {
      expect(() => {
        singleSpa.registerApplication(
          "bad-custom-props-will-throw-error-app",
          app,
          () => true,
          () => {}
        );
      }).toThrowError(errorsMessages.customProps.args);
      expect(() => {
        singleSpa.registerApplication({
          name: "bad-custom-props-will-throw-error-app",
          app,
          activeWhen: () => true,
          customProps: () => {}
        });
      }).toThrowError(errorsMessages.customProps.config);
    });

    it("should throw when I pass in an array for custom props", () => {
      expect(() => {
        singleSpa.registerApplication(
          "bad-custom-props-will-throw-error-app",
          app,
          () => true,
          []
        );
      }).toThrowError(errorsMessages.customProps.args);
      expect(() => {
        singleSpa.registerApplication({
          name: "bad-custom-props-will-throw-error-app",
          app,
          activeWhen: () => true,
          customProps: []
        });
      }).toThrowError(errorsMessages.customProps.config);
    });

    it("should throw when I pass invalid keys to object configuration ", () => {
      expect(() => {
        singleSpa.registerApplication({
          name: "invalid-key-in-object-config",
          app,
          activeWhen: () => true,
          invalidKey: "invalidKey",
          superInvalidKey: {}
        });
      }).toThrowError("Invalid keys: invalidKey, superInvalidKey.");
    });
  });
});
