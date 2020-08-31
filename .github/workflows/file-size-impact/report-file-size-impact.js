import {
  reportFileSizeImpact,
  readGithubWorkflowEnv,
} from "@jsenv/file-size-impact";

reportFileSizeImpact({
  ...readGithubWorkflowEnv(),
  trackingConfig: {
    dist: {
      "./lib/**/*": true,
      "./lib/**/*.map": false,
    },
  },
});
