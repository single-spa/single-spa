import resolve from "rollup-plugin-node-resolve";
import babel from "rollup-plugin-babel";
import commonjs from "rollup-plugin-commonjs";
import analyzer from "rollup-plugin-analyzer";
import replace from "@rollup/plugin-replace";
import packageJson from "./package.json";

const isProduction = process.env.NODE_ENV === "production";
const useAnalyzer = process.env.ANALYZER === "analyzer";

const replaceOpts = {
  "process.env.BABEL_ENV": null,
  __DEV__: !isProduction,
};

const babelOpts = {
  exclude: "node_modules/**",
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

export default (async () => [
  {
    input: "./src/single-spa.js",
    output: [
      {
        file: `./lib/umd/single-spa${isProduction ? ".min" : ".dev"}.js`,
        format: "umd",
        name: "singleSpa",
        sourcemap: true,
        banner: generateBanner("UMD"),
      },
      {
        file: `./lib/system/single-spa${isProduction ? ".min" : ".dev"}.js`,
        format: "system",
        sourcemap: true,
        banner: generateBanner("SystemJS"),
      },
      {
        file: `./lib/esm/single-spa${isProduction ? ".min" : ".dev"}.js`,
        format: "esm",
        sourcemap: true,
        banner: generateBanner("ESM"),
      },
    ],
    plugins: [
      replace(replaceOpts),
      resolve(),
      babel(babelOpts),
      commonjs(),
      isProduction && (await import("rollup-plugin-terser")).terser(terserOpts),
      useAnalyzer && analyzer(),
    ],
  },
  {
    input: "./src/single-spa.js",
    output: {
      file: `./lib/es2015/single-spa${isProduction ? ".min" : ".dev"}.js`,
      format: "esm",
      sourcemap: true,
      banner: generateBanner("ES2015"),
    },
    plugins: [
      replace(replaceOpts),
      resolve(),
      babel(
        Object.assign({}, babelOpts, {
          envName: "esm",
        })
      ),
      commonjs(),
      isProduction &&
        (await import("rollup-plugin-terser")).terser(
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
