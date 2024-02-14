export default {
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "single-spa": "<rootDir>/src/single-spa.ts",
  },
  globals: {
    __SINGLE_SPA_DEVTOOLS__: {},
    __DEV__: true,
    __PROFILE__: true,
  },
};
