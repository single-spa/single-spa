export default {
  testEnvironment: "node",
  moduleNameMapper: {
    "single-spa": "<rootDir>/src/single-spa.ts",
  },
  testRegex: "node-spec/.+.(spec|test).js",
  globals: {
    __SINGLE_SPA_DEVTOOLS__: {},
    __DEV__: true,
    __PROFILE__: true,
  },
};
