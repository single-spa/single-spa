const {
  reportFileSizeImpact,
  readGithubWorkflowEnv,
} = require("@jsenv/file-size-impact");

reportFileSizeImpact({
  ...readGithubWorkflowEnv(),
  trackingConfig: {
    dist: {
      "./lib/**/*": true,
      "./lib/**/*.map": false,
    },
  },
});
