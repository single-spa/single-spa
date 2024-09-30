import es5 from "eslint-plugin-es5";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  ...compat.extends("important-stuff"),
  {
    files: ["**/*.ts"],
    plugins: {
      es5,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        __DEV__: true,
        __PROFILE__: true,
      },

      parser: tsParser,
      ecmaVersion: 5,
      sourceType: "commonjs",

      parserOptions: {
        project: "./tsconfig.json",
      },
    },

    rules: {
      "es5/no-binary-and-octal-literals": "error",
      "es5/no-classes": "error",
      "es5/no-for-of": "error",
      "es5/no-generators": "error",
      "es5/no-object-super": "error",
      "es5/no-typeof-symbol": "error",
      "es5/no-unicode-code-point-escape": "error",
      "es5/no-unicode-regex": "error",
      "es5/no-computed-properties": "off",
      "es5/no-destructuring": "off",
      "es5/no-default-parameters": "off",
      "es5/no-spread": "off",
      "es5/no-modules": "off",
      "es5/no-exponentiation-operator": "off",
      "es5/no-block-scoping": "off",
      "es5/no-arrow-functions": "off",
      "es5/no-shorthand-properties": "off",
      "es5/no-rest-parameters": "off",
      "es5/no-template-literals": "off",
    },
  },
];
