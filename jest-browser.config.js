module.exports = {
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "single-spa": "<rootDir>/src/single-spa.js",
  },
  setupFiles: ["<rootDir>/spec/test-setup.js"],
};
