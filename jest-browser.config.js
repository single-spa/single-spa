export default {
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "single-spa": "<rootDir>/src/single-spa.js",
  },
  globals: {
    __SINGLE_SPA_DEVTOOLS__: {},
    __DEV__: true,
  },
};
