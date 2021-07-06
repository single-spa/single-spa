export default {
  testEnvironment: "node",
  moduleNameMapper: {
    "single-spa": "<rootDir>/src/single-spa.js",
  },
  testRegex: "node-spec/.+.(spec|test).js",
  globals: {
    __SINGLE_SPA_DEVTOOLS__: {},
    __DEV__: true,
  },
};
