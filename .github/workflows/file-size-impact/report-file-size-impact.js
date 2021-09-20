import {
  reportFileSizeImpact,
  readGithubWorkflowEnv,
} from "@jsenv/file-size-impact";

reportFileSizeImpact({
  ...readGithubWorkflowEnv(),
  installCommand: "pnpm install",
  trackingConfig: {
    dist: {
      "./lib/**/*": true,
      "./lib/**/*.map": false,
    },
  },
});
