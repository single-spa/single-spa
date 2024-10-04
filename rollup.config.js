import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import analyzer from "rollup-plugin-analyzer";
import replace from "@rollup/plugin-replace";
import typescript from "@rollup/plugin-typescript";
import packageJson from "./package.json" with { type: "json" };
import { dts } from "rollup-plugin-dts";

const isProduction = process.env.ROLLUP_ENV === "production";
const useAnalyzer = process.env.ANALYZER === "analyzer";

const replaceOpts = {
  "process.env.BABEL_ENV": null,
  __DEV__: !isProduction,
  __PROFILE__: !isProduction,
  preventAssignment: true,
};

const babelOpts = {
  exclude: "node_modules/**",
  babelHelpers: "bundled",
  extensions: [".js", ".ts"],
};

const terserOpts = {
  compress: {
    passes: 2,
  },
  output: {
    comments(node, comment) {
      return comment.value.trim().startsWith("single-spa@");
    },
  },
  module: true,
};

const resolveOpts = {
  extensions: [".ts", ".js"],
};

function generateBanner(format) {
  return `/* single-spa@${packageJson.version} - ${format} - ${
    isProduction ? "prod" : "dev"
  } */`;
}

const commonPlugins = [
  replace(replaceOpts),
  resolve(resolveOpts),
  babel(babelOpts),
  commonjs(),
  isProduction && (await import("@rollup/plugin-terser")).default(terserOpts),
  useAnalyzer && analyzer(),
];

const commonConfiguration = {
  input: `./src/single-spa${isProduction ? "" : ".profile"}.ts`,
};

export default async () => [
  // UMD build
  {
    ...commonConfiguration,
    output: {
      file: `./lib/umd/single-spa${isProduction ? ".min" : ".dev"}.cjs`,
      format: "umd",
      name: "singleSpa",
      sourcemap: true,
      banner: generateBanner("UMD"),
    },
    plugins: [
      ...commonPlugins,
      // Typecheck, and emit declaration files
      typescript({
        declarationDir: "./lib/umd/types-unbundled",
        noEmitOnError: true,
      }),
    ],
  },
  // ESM build
  {
    ...commonConfiguration,
    output: {
      file: `./lib/esm/single-spa${isProduction ? ".min" : ".dev"}.js`,
      format: "esm",
      sourcemap: true,
      banner: generateBanner("ESM"),
    },
    plugins: [
      ...commonPlugins,
      // Typecheck, and emit declaration files
      typescript({
        declarationDir: "./lib/esm/types-unbundled",
        noEmitOnError: true,
      }),
    ],
  },
  // System build
  {
    ...commonConfiguration,
    output: {
      file: `./lib/system/single-spa${isProduction ? ".min" : ".dev"}.cjs`,
      format: "system",
      sourcemap: true,
      banner: generateBanner("SystemJS"),
    },
    plugins: [...commonPlugins],
  },
  // For compatibility with node16 module resolution, types are bundled
  // Bundle ESM types
  {
    input: `./lib/esm/types-unbundled/single-spa.d.ts`,
    output: {
      file: `./lib/esm/single-spa.d.ts`,
      format: "es",
    },
    plugins: [dts()],
  },
  // Bundle CJS types
  {
    input: `./lib/umd/types-unbundled/single-spa.d.ts`,
    output: {
      file: `./lib/umd/single-spa.d.cts`,
      format: "cjs",
    },
    plugins: [dts()],
  },
];
