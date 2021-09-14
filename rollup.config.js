import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import analyzer from "rollup-plugin-analyzer";
import replace from "@rollup/plugin-replace";
import packageJson from "./package.json";

const isProduction = process.env.NODE_ENV === "production";
const useAnalyzer = process.env.ANALYZER === "analyzer";

const replaceOpts = {
  "process.env.BABEL_ENV": null,
  __DEV__: !isProduction,
  __PROFILE__: !isProduction,
  preventAssignment: true,
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
    input: `./src/single-spa${isProduction ? "" : ".profile"}.js`,
    output: [
      {
        file: `./lib/es5/umd/single-spa${isProduction ? ".min" : ".dev"}.cjs`,
        format: "umd",
        name: "singleSpa",
        sourcemap: true,
        banner: generateBanner("UMD ES5"),
      },
      {
        file: `./lib/es5/system/single-spa${isProduction ? ".min" : ".dev"}.js`,
        format: "system",
        sourcemap: true,
        banner: generateBanner("SystemJS ES5"),
      },
      {
        file: `./lib/es5/esm/single-spa${isProduction ? ".min" : ".dev"}.js`,
        format: "esm",
        sourcemap: true,
        banner: generateBanner("ESM ES5"),
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
    input: `./src/single-spa${isProduction ? "" : ".profile"}.js`,
    output: [
      {
        file: `./lib/es2015/umd/single-spa${
          isProduction ? ".min" : ".dev"
        }.cjs`,
        format: "umd",
        name: "singleSpa",
        sourcemap: true,
        banner: generateBanner("UMD ES2015"),
      },
      {
        file: `./lib/es2015/esm/single-spa${isProduction ? ".min" : ".dev"}.js`,
        format: "esm",
        sourcemap: true,
        banner: generateBanner("ES2015"),
      },
      {
        file: `./lib/es2015/system/single-spa${
          isProduction ? ".min" : ".dev"
        }.js`,
        format: "system",
        sourcemap: true,
        banner: generateBanner("SystemJS ES2015"),
      },
    ],
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
