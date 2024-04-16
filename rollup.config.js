import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import analyzer from "rollup-plugin-analyzer";
import replace from "@rollup/plugin-replace";
import packageJson from "./package.json";

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
};

const resolveOpts = {
  extensions: [".ts", ".js"],
};

export default (async () => [
  {
    input: `./src/single-spa${isProduction ? "" : ".profile"}.ts`,
    output: [
      {
        file: `./lib/umd/single-spa${isProduction ? ".min" : ".dev"}.cjs`,
        format: "umd",
        name: "singleSpa",
        sourcemap: true,
        banner: generateBanner("UMD"),
      },
      {
        file: `./lib/esm/single-spa${isProduction ? ".min" : ".dev"}.js`,
        format: "esm",
        sourcemap: true,
        banner: generateBanner("ESM"),
      },
      {
        file: `./lib/system/single-spa${isProduction ? ".min" : ".dev"}.js`,
        format: "system",
        sourcemap: true,
        banner: generateBanner("SystemJS"),
      },
    ],
    plugins: [
      replace(replaceOpts),
      resolve(resolveOpts),
      babel(
        Object.assign({}, babelOpts, {
          envName: "esm",
        })
      ),
      commonjs(),
      isProduction &&
        (await import("@rollup/plugin-terser")).default(
          Object.assign({}, terserOpts, {
            ecma: 6,
            module: true,
          })
        ),
      useAnalyzer && analyzer(),
    ],
  },
])();

function generateBanner(format) {
  return `/* single-spa@${packageJson.version} - ${format} - ${
    isProduction ? "prod" : "dev"
  } */`;
}
