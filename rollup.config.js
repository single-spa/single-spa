import resolve from "rollup-plugin-node-resolve";
import babel from "rollup-plugin-babel";
import commonjs from "rollup-plugin-commonjs";
import analyzer from "rollup-plugin-analyzer";
import replace from "@rollup/plugin-replace";

const isProduction = process.env.NODE_ENV === "production";
const useAnalyzer = process.env.ANALYZER === "analyzer";

const replaceOpts = {
  "process.env.BABEL_ENV": null,
  __DEV__: !isProduction
};

const babelOpts = {
  exclude: "node_modules/**"
};

const terserOpts = {
  compress: {
    passes: 2
  },
  module: true,
  ecma: 5
};

export default (async () => [
  {
    input: "./src/single-spa.js",
    output: {
      file: `./lib/umd/single-spa${isProduction ? ".min" : ".dev"}.js`,
      format: "umd",
      name: "singleSpa",
      sourcemap: true
    },
    plugins: [
      replace(replaceOpts),
      resolve(),
      commonjs(),
      babel(babelOpts),
      isProduction && (await import("rollup-plugin-terser")).terser(terserOpts),
      useAnalyzer && analyzer()
    ]
  },
  {
    input: "./src/single-spa.js",
    output: {
      file: `./lib/esm/single-spa${isProduction ? ".min" : ".dev"}.js`,
      format: "esm",
      sourcemap: true
    },
    plugins: [
      replace(replaceOpts),
      resolve(),
      commonjs(),
      babel(
        Object.assign({}, babelOpts, {
          envName: "esm"
        })
      ),
      isProduction &&
        (await import("rollup-plugin-terser")).terser(
          Object.assign({}, terserOpts, {
            ecma: 6
          })
        ),
      useAnalyzer && analyzer()
    ]
  },
  {
    input: "./src/single-spa.js",
    output: {
      file: `./lib/system/single-spa${isProduction ? ".min" : ".dev"}.js`,
      format: "system",
      sourcemap: true
    },
    plugins: [
      replace(replaceOpts),
      resolve(),
      commonjs(),
      babel(babelOpts),
      isProduction && (await import("rollup-plugin-terser")).terser(terserOpts),
      useAnalyzer && analyzer()
    ]
  }
])();
