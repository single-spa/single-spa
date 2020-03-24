module.exports = {
  testEnvironment: "node",
  moduleNameMapper: {
    "single-spa": "<rootDir>/src/single-spa.js",
  },
  testRegex: "node-spec/.+.(spec|test).js",
};
