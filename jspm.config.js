SystemJS.config({
  paths: {
    "npm:": "jspm_packages/npm/",
    "github:": "jspm_packages/github/",
    "single-spa/": "src/"
  },
  browserConfig: {
    "baseURL": "/base"
  },
  devConfig: {
    "map": {
      "plugin-babel": "npm:systemjs-plugin-babel@0.0.13",
      "babel-preset-stage-1": "npm:babel-preset-stage-1@6.13.0",
      "module": "npm:jspm-nodelibs-module@0.2.0",
      "http": "npm:jspm-nodelibs-http@0.2.0",
      "url": "npm:jspm-nodelibs-url@0.2.0",
      "babel-preset-es0015": "npm:babel-preset-es2015@6.13.2",
      "babel-preset-stage-3": "npm:babel-preset-stage-3@6.11.0"
    },
    "packages": {
      "npm:babel-preset-stage-1@6.13.0": {
        "map": {
          "babel-plugin-transform-export-extensions": "npm:babel-plugin-transform-export-extensions@6.8.0",
          "babel-preset-stage-2": "npm:babel-preset-stage-2@6.13.0",
          "babel-plugin-transform-class-constructor-call": "npm:babel-plugin-transform-class-constructor-call@6.8.0"
        }
      },
      "npm:babel-preset-stage-2@6.13.0": {
        "map": {
          "babel-preset-stage-3": "npm:babel-preset-stage-3@6.11.0",
          "babel-plugin-transform-decorators": "npm:babel-plugin-transform-decorators@6.13.0",
          "babel-plugin-transform-class-properties": "npm:babel-plugin-transform-class-properties@6.11.5",
          "babel-plugin-transform-object-rest-spread": "npm:babel-plugin-transform-object-rest-spread@6.8.0"
        }
      },
      "npm:babel-plugin-transform-class-constructor-call@6.8.0": {
        "map": {
          "babel-template": "npm:babel-template@6.9.0",
          "babel-plugin-syntax-class-constructor-call": "npm:babel-plugin-syntax-class-constructor-call@6.13.0",
          "babel-runtime": "npm:babel-runtime@6.11.6"
        }
      },
      "npm:babel-plugin-transform-export-extensions@6.8.0": {
        "map": {
          "babel-plugin-syntax-export-extensions": "npm:babel-plugin-syntax-export-extensions@6.13.0",
          "babel-runtime": "npm:babel-runtime@6.11.6"
        }
      },
      "npm:babel-plugin-transform-decorators@6.13.0": {
        "map": {
          "babel-types": "npm:babel-types@6.13.0",
          "babel-template": "npm:babel-template@6.9.0",
          "babel-runtime": "npm:babel-runtime@6.11.6",
          "babel-helper-define-map": "npm:babel-helper-define-map@6.9.0",
          "babel-plugin-syntax-decorators": "npm:babel-plugin-syntax-decorators@6.13.0",
          "babel-helper-explode-class": "npm:babel-helper-explode-class@6.8.0"
        }
      },
      "npm:babel-plugin-transform-class-properties@6.11.5": {
        "map": {
          "babel-helper-function-name": "npm:babel-helper-function-name@6.8.0",
          "babel-runtime": "npm:babel-runtime@6.11.6",
          "babel-plugin-syntax-class-properties": "npm:babel-plugin-syntax-class-properties@6.13.0"
        }
      },
      "npm:babel-plugin-transform-object-rest-spread@6.8.0": {
        "map": {
          "babel-runtime": "npm:babel-runtime@6.11.6",
          "babel-plugin-syntax-object-rest-spread": "npm:babel-plugin-syntax-object-rest-spread@6.13.0"
        }
      },
      "npm:babel-helper-define-map@6.9.0": {
        "map": {
          "babel-runtime": "npm:babel-runtime@6.11.6",
          "lodash": "npm:lodash@4.15.0",
          "babel-types": "npm:babel-types@6.13.0",
          "babel-helper-function-name": "npm:babel-helper-function-name@6.8.0"
        }
      },
      "npm:babel-helper-explode-class@6.8.0": {
        "map": {
          "babel-traverse": "npm:babel-traverse@6.13.0",
          "babel-types": "npm:babel-types@6.13.0",
          "babel-runtime": "npm:babel-runtime@6.11.6",
          "babel-helper-bindify-decorators": "npm:babel-helper-bindify-decorators@6.8.0"
        }
      },
      "npm:babel-helper-bindify-decorators@6.8.0": {
        "map": {
          "babel-runtime": "npm:babel-runtime@6.11.6",
          "babel-traverse": "npm:babel-traverse@6.13.0",
          "babel-types": "npm:babel-types@6.13.0"
        }
      },
      "npm:stream-http@2.3.1": {
        "map": {
          "inherits": "npm:inherits@2.0.1",
          "readable-stream": "npm:readable-stream@2.1.4",
          "builtin-status-codes": "npm:builtin-status-codes@2.0.0",
          "to-arraybuffer": "npm:to-arraybuffer@1.0.1",
          "xtend": "npm:xtend@4.0.1"
        }
      },
      "npm:url@0.11.0": {
        "map": {
          "querystring": "npm:querystring@0.2.0",
          "punycode": "npm:punycode@1.3.2"
        }
      },
      "npm:babel-traverse@6.13.0": {
        "map": {
          "lodash": "npm:lodash@4.15.0",
          "babel-types": "npm:babel-types@6.13.0",
          "babel-runtime": "npm:babel-runtime@6.11.6",
          "debug": "npm:debug@2.2.0",
          "babel-messages": "npm:babel-messages@6.8.0",
          "babel-code-frame": "npm:babel-code-frame@6.11.0",
          "invariant": "npm:invariant@2.2.1",
          "globals": "npm:globals@8.18.0",
          "babylon": "npm:babylon@6.9.1"
        }
      },
      "npm:babel-types@6.13.0": {
        "map": {
          "babel-traverse": "npm:babel-traverse@6.13.0",
          "lodash": "npm:lodash@4.15.0",
          "babel-runtime": "npm:babel-runtime@6.11.6",
          "to-fast-properties": "npm:to-fast-properties@1.0.2",
          "esutils": "npm:esutils@2.0.2"
        }
      },
      "npm:babel-helper-function-name@6.8.0": {
        "map": {
          "babel-types": "npm:babel-types@6.13.0",
          "babel-traverse": "npm:babel-traverse@6.13.0",
          "babel-helper-get-function-arity": "npm:babel-helper-get-function-arity@6.8.0",
          "babel-template": "npm:babel-template@6.9.0",
          "babel-runtime": "npm:babel-runtime@6.11.6"
        }
      },
      "npm:babel-helper-get-function-arity@6.8.0": {
        "map": {
          "babel-runtime": "npm:babel-runtime@6.11.6",
          "babel-types": "npm:babel-types@6.13.0"
        }
      },
      "npm:babel-template@6.9.0": {
        "map": {
          "babel-traverse": "npm:babel-traverse@6.13.0",
          "babel-types": "npm:babel-types@6.13.0",
          "babel-runtime": "npm:babel-runtime@6.11.6",
          "lodash": "npm:lodash@4.15.0",
          "babylon": "npm:babylon@6.9.1"
        }
      },
      "npm:babel-code-frame@6.11.0": {
        "map": {
          "babel-runtime": "npm:babel-runtime@6.11.6",
          "esutils": "npm:esutils@2.0.2",
          "js-tokens": "npm:js-tokens@2.0.0",
          "chalk": "npm:chalk@1.1.3"
        }
      },
      "npm:babel-messages@6.8.0": {
        "map": {
          "babel-runtime": "npm:babel-runtime@6.11.6"
        }
      },
      "npm:babylon@6.8.4": {
        "map": {
          "babel-runtime": "npm:babel-runtime@6.11.6"
        }
      },
      "npm:babel-preset-stage-3@6.11.0": {
        "map": {
          "babel-plugin-syntax-trailing-function-commas": "npm:babel-plugin-syntax-trailing-function-commas@6.13.0",
          "babel-plugin-transform-async-to-generator": "npm:babel-plugin-transform-async-to-generator@6.8.0",
          "babel-plugin-transform-exponentiation-operator": "npm:babel-plugin-transform-exponentiation-operator@6.8.0"
        }
      },
      "npm:babel-plugin-transform-async-to-generator@6.8.0": {
        "map": {
          "babel-runtime": "npm:babel-runtime@6.11.6",
          "babel-helper-remap-async-to-generator": "npm:babel-helper-remap-async-to-generator@6.11.2",
          "babel-plugin-syntax-async-functions": "npm:babel-plugin-syntax-async-functions@6.13.0"
        }
      },
      "npm:babel-runtime@6.11.6": {
        "map": {
          "regenerator-runtime": "npm:regenerator-runtime@0.9.5",
          "core-js": "npm:core-js@2.4.1"
        }
      },
      "npm:babel-plugin-transform-exponentiation-operator@6.8.0": {
        "map": {
          "babel-runtime": "npm:babel-runtime@6.11.6",
          "babel-plugin-syntax-exponentiation-operator": "npm:babel-plugin-syntax-exponentiation-operator@6.13.0",
          "babel-helper-builder-binary-assignment-operator-visitor": "npm:babel-helper-builder-binary-assignment-operator-visitor@6.8.0"
        }
      },
      "npm:invariant@2.2.1": {
        "map": {
          "loose-envify": "npm:loose-envify@1.2.0"
        }
      },
      "npm:loose-envify@1.2.0": {
        "map": {
          "js-tokens": "npm:js-tokens@1.0.3"
        }
      },
      "npm:debug@2.2.0": {
        "map": {
          "ms": "npm:ms@0.7.1"
        }
      },
      "npm:babel-helper-remap-async-to-generator@6.11.2": {
        "map": {
          "babel-runtime": "npm:babel-runtime@6.11.6",
          "babel-template": "npm:babel-template@6.9.0",
          "babel-types": "npm:babel-types@6.13.0",
          "babel-traverse": "npm:babel-traverse@6.13.0",
          "babel-helper-function-name": "npm:babel-helper-function-name@6.8.0"
        }
      },
      "npm:chalk@1.1.3": {
        "map": {
          "has-ansi": "npm:has-ansi@2.0.0",
          "strip-ansi": "npm:strip-ansi@3.0.1",
          "supports-color": "npm:supports-color@2.0.0",
          "ansi-styles": "npm:ansi-styles@2.2.1",
          "escape-string-regexp": "npm:escape-string-regexp@1.0.5"
        }
      },
      "npm:babel-helper-builder-binary-assignment-operator-visitor@6.8.0": {
        "map": {
          "babel-runtime": "npm:babel-runtime@6.11.6",
          "babel-types": "npm:babel-types@6.13.0",
          "babel-helper-explode-assignable-expression": "npm:babel-helper-explode-assignable-expression@6.8.0"
        }
      },
      "npm:babel-helper-explode-assignable-expression@6.8.0": {
        "map": {
          "babel-traverse": "npm:babel-traverse@6.13.0",
          "babel-runtime": "npm:babel-runtime@6.11.6",
          "babel-types": "npm:babel-types@6.13.0"
        }
      },
      "npm:has-ansi@2.0.0": {
        "map": {
          "ansi-regex": "npm:ansi-regex@2.0.0"
        }
      },
      "npm:strip-ansi@3.0.1": {
        "map": {
          "ansi-regex": "npm:ansi-regex@2.0.0"
        }
      },
      "npm:babel-preset-es2015@6.13.2": {
        "map": {
          "babel-plugin-transform-es2015-block-scoping": "npm:babel-plugin-transform-es2015-block-scoping@6.10.1",
          "babel-plugin-transform-es2015-for-of": "npm:babel-plugin-transform-es2015-for-of@6.8.0",
          "babel-plugin-check-es2015-constants": "npm:babel-plugin-check-es2015-constants@6.8.0",
          "babel-plugin-transform-es2015-classes": "npm:babel-plugin-transform-es2015-classes@6.9.0",
          "babel-plugin-transform-es2015-arrow-functions": "npm:babel-plugin-transform-es2015-arrow-functions@6.8.0",
          "babel-plugin-transform-es2015-block-scoped-functions": "npm:babel-plugin-transform-es2015-block-scoped-functions@6.8.0",
          "babel-plugin-transform-es2015-computed-properties": "npm:babel-plugin-transform-es2015-computed-properties@6.8.0",
          "babel-plugin-transform-es2015-duplicate-keys": "npm:babel-plugin-transform-es2015-duplicate-keys@6.8.0",
          "babel-plugin-transform-es2015-literals": "npm:babel-plugin-transform-es2015-literals@6.8.0",
          "babel-plugin-transform-es2015-function-name": "npm:babel-plugin-transform-es2015-function-name@6.9.0",
          "babel-plugin-transform-es2015-modules-umd": "npm:babel-plugin-transform-es2015-modules-umd@6.12.0",
          "babel-plugin-transform-es2015-destructuring": "npm:babel-plugin-transform-es2015-destructuring@6.9.0",
          "babel-plugin-transform-es2015-object-super": "npm:babel-plugin-transform-es2015-object-super@6.8.0",
          "babel-plugin-transform-es2015-unicode-regex": "npm:babel-plugin-transform-es2015-unicode-regex@6.11.0",
          "babel-plugin-transform-es2015-spread": "npm:babel-plugin-transform-es2015-spread@6.8.0",
          "babel-plugin-transform-es2015-template-literals": "npm:babel-plugin-transform-es2015-template-literals@6.8.0",
          "babel-plugin-transform-es2015-typeof-symbol": "npm:babel-plugin-transform-es2015-typeof-symbol@6.8.0",
          "babel-plugin-transform-es2015-modules-amd": "npm:babel-plugin-transform-es2015-modules-amd@6.8.0",
          "babel-plugin-transform-es2015-parameters": "npm:babel-plugin-transform-es2015-parameters@6.11.4",
          "babel-plugin-transform-es2015-modules-systemjs": "npm:babel-plugin-transform-es2015-modules-systemjs@6.12.0",
          "babel-plugin-transform-es2015-modules-commonjs": "npm:babel-plugin-transform-es2015-modules-commonjs@6.11.5",
          "babel-plugin-transform-es2015-shorthand-properties": "npm:babel-plugin-transform-es2015-shorthand-properties@6.8.0",
          "babel-plugin-transform-es2015-sticky-regex": "npm:babel-plugin-transform-es2015-sticky-regex@6.8.0",
          "babel-plugin-transform-regenerator": "npm:babel-plugin-transform-regenerator@6.11.4"
        }
      },
      "npm:babel-plugin-transform-es2015-modules-umd@6.12.0": {
        "map": {
          "babel-plugin-transform-es2015-modules-amd": "npm:babel-plugin-transform-es2015-modules-amd@6.8.0",
          "babel-template": "npm:babel-template@6.9.0",
          "babel-runtime": "npm:babel-runtime@6.11.6"
        }
      },
      "npm:babel-plugin-transform-es2015-modules-amd@6.8.0": {
        "map": {
          "babel-plugin-transform-es2015-modules-commonjs": "npm:babel-plugin-transform-es2015-modules-commonjs@6.11.5",
          "babel-template": "npm:babel-template@6.9.0",
          "babel-runtime": "npm:babel-runtime@6.11.6"
        }
      },
      "npm:babel-plugin-transform-es2015-block-scoping@6.10.1": {
        "map": {
          "babel-traverse": "npm:babel-traverse@6.13.0",
          "lodash": "npm:lodash@4.15.0",
          "babel-types": "npm:babel-types@6.13.0",
          "babel-template": "npm:babel-template@6.9.0",
          "babel-runtime": "npm:babel-runtime@6.11.6"
        }
      },
      "npm:babel-plugin-transform-es2015-classes@6.9.0": {
        "map": {
          "babel-traverse": "npm:babel-traverse@6.13.0",
          "babel-helper-function-name": "npm:babel-helper-function-name@6.8.0",
          "babel-helper-replace-supers": "npm:babel-helper-replace-supers@6.8.0",
          "babel-types": "npm:babel-types@6.13.0",
          "babel-template": "npm:babel-template@6.9.0",
          "babel-runtime": "npm:babel-runtime@6.11.6",
          "babel-helper-optimise-call-expression": "npm:babel-helper-optimise-call-expression@6.8.0",
          "babel-messages": "npm:babel-messages@6.8.0",
          "babel-helper-define-map": "npm:babel-helper-define-map@6.9.0"
        }
      },
      "npm:babel-plugin-transform-es2015-parameters@6.11.4": {
        "map": {
          "babel-traverse": "npm:babel-traverse@6.13.0",
          "babel-types": "npm:babel-types@6.13.0",
          "babel-helper-get-function-arity": "npm:babel-helper-get-function-arity@6.8.0",
          "babel-template": "npm:babel-template@6.9.0",
          "babel-runtime": "npm:babel-runtime@6.11.6",
          "babel-helper-call-delegate": "npm:babel-helper-call-delegate@6.8.0"
        }
      },
      "npm:babel-plugin-transform-es2015-function-name@6.9.0": {
        "map": {
          "babel-helper-function-name": "npm:babel-helper-function-name@6.8.0",
          "babel-types": "npm:babel-types@6.13.0",
          "babel-runtime": "npm:babel-runtime@6.11.6"
        }
      },
      "npm:babel-plugin-transform-es2015-object-super@6.8.0": {
        "map": {
          "babel-helper-replace-supers": "npm:babel-helper-replace-supers@6.8.0",
          "babel-runtime": "npm:babel-runtime@6.11.6"
        }
      },
      "npm:babel-plugin-transform-es2015-duplicate-keys@6.8.0": {
        "map": {
          "babel-types": "npm:babel-types@6.13.0",
          "babel-runtime": "npm:babel-runtime@6.11.6"
        }
      },
      "npm:babel-plugin-transform-es2015-modules-commonjs@6.11.5": {
        "map": {
          "babel-types": "npm:babel-types@6.13.0",
          "babel-plugin-transform-strict-mode": "npm:babel-plugin-transform-strict-mode@6.11.3",
          "babel-template": "npm:babel-template@6.9.0",
          "babel-runtime": "npm:babel-runtime@6.11.6"
        }
      },
      "npm:babel-plugin-transform-es2015-unicode-regex@6.11.0": {
        "map": {
          "babel-helper-regex": "npm:babel-helper-regex@6.9.0",
          "babel-runtime": "npm:babel-runtime@6.11.6",
          "regexpu-core": "npm:regexpu-core@2.0.0"
        }
      },
      "npm:babel-helper-replace-supers@6.8.0": {
        "map": {
          "babel-traverse": "npm:babel-traverse@6.13.0",
          "babel-types": "npm:babel-types@6.13.0",
          "babel-template": "npm:babel-template@6.9.0",
          "babel-runtime": "npm:babel-runtime@6.11.6",
          "babel-helper-optimise-call-expression": "npm:babel-helper-optimise-call-expression@6.8.0",
          "babel-messages": "npm:babel-messages@6.8.0"
        }
      },
      "npm:babel-plugin-transform-es2015-computed-properties@6.8.0": {
        "map": {
          "babel-template": "npm:babel-template@6.9.0",
          "babel-runtime": "npm:babel-runtime@6.11.6",
          "babel-helper-define-map": "npm:babel-helper-define-map@6.9.0"
        }
      },
      "npm:babel-plugin-transform-es2015-modules-systemjs@6.12.0": {
        "map": {
          "babel-template": "npm:babel-template@6.9.0",
          "babel-helper-hoist-variables": "npm:babel-helper-hoist-variables@6.8.0",
          "babel-runtime": "npm:babel-runtime@6.11.6"
        }
      },
      "npm:babel-helper-regex@6.9.0": {
        "map": {
          "lodash": "npm:lodash@4.15.0",
          "babel-types": "npm:babel-types@6.13.0",
          "babel-runtime": "npm:babel-runtime@6.11.6"
        }
      },
      "npm:babel-plugin-transform-strict-mode@6.11.3": {
        "map": {
          "babel-types": "npm:babel-types@6.13.0",
          "babel-runtime": "npm:babel-runtime@6.11.6"
        }
      },
      "npm:babel-plugin-transform-es2015-for-of@6.8.0": {
        "map": {
          "babel-runtime": "npm:babel-runtime@6.11.6"
        }
      },
      "npm:babel-plugin-check-es2015-constants@6.8.0": {
        "map": {
          "babel-runtime": "npm:babel-runtime@6.11.6"
        }
      },
      "npm:babel-plugin-transform-es2015-arrow-functions@6.8.0": {
        "map": {
          "babel-runtime": "npm:babel-runtime@6.11.6"
        }
      },
      "npm:babel-plugin-transform-es2015-block-scoped-functions@6.8.0": {
        "map": {
          "babel-runtime": "npm:babel-runtime@6.11.6"
        }
      },
      "npm:babel-plugin-transform-es2015-literals@6.8.0": {
        "map": {
          "babel-runtime": "npm:babel-runtime@6.11.6"
        }
      },
      "npm:babel-plugin-transform-es2015-destructuring@6.9.0": {
        "map": {
          "babel-runtime": "npm:babel-runtime@6.11.6"
        }
      },
      "npm:babel-plugin-transform-es2015-spread@6.8.0": {
        "map": {
          "babel-runtime": "npm:babel-runtime@6.11.6"
        }
      },
      "npm:babel-plugin-transform-es2015-typeof-symbol@6.8.0": {
        "map": {
          "babel-runtime": "npm:babel-runtime@6.11.6"
        }
      },
      "npm:babel-plugin-transform-es2015-template-literals@6.8.0": {
        "map": {
          "babel-runtime": "npm:babel-runtime@6.11.6"
        }
      },
      "npm:babel-helper-hoist-variables@6.8.0": {
        "map": {
          "babel-runtime": "npm:babel-runtime@6.11.6",
          "babel-types": "npm:babel-types@6.13.0"
        }
      },
      "npm:babel-helper-optimise-call-expression@6.8.0": {
        "map": {
          "babel-runtime": "npm:babel-runtime@6.11.6",
          "babel-types": "npm:babel-types@6.13.0"
        }
      },
      "npm:babel-helper-call-delegate@6.8.0": {
        "map": {
          "babel-helper-hoist-variables": "npm:babel-helper-hoist-variables@6.8.0",
          "babel-traverse": "npm:babel-traverse@6.13.0",
          "babel-runtime": "npm:babel-runtime@6.11.6",
          "babel-types": "npm:babel-types@6.13.0"
        }
      },
      "npm:babel-plugin-transform-es2015-shorthand-properties@6.8.0": {
        "map": {
          "babel-types": "npm:babel-types@6.13.0",
          "babel-runtime": "npm:babel-runtime@6.11.6"
        }
      },
      "npm:babel-plugin-transform-es2015-sticky-regex@6.8.0": {
        "map": {
          "babel-helper-regex": "npm:babel-helper-regex@6.9.0",
          "babel-types": "npm:babel-types@6.13.0",
          "babel-runtime": "npm:babel-runtime@6.11.6"
        }
      },
      "npm:babel-plugin-transform-regenerator@6.11.4": {
        "map": {
          "babel-plugin-transform-es2015-block-scoping": "npm:babel-plugin-transform-es2015-block-scoping@6.10.1",
          "babel-plugin-transform-es2015-for-of": "npm:babel-plugin-transform-es2015-for-of@6.8.0",
          "babel-traverse": "npm:babel-traverse@6.13.0",
          "babel-types": "npm:babel-types@6.13.0",
          "babel-runtime": "npm:babel-runtime@6.11.6",
          "babylon": "npm:babylon@6.8.4",
          "private": "npm:private@0.1.6",
          "babel-plugin-syntax-async-functions": "npm:babel-plugin-syntax-async-functions@6.13.0",
          "babel-core": "npm:babel-core@6.13.2"
        }
      },
      "npm:regexpu-core@2.0.0": {
        "map": {
          "regjsparser": "npm:regjsparser@0.1.5",
          "regenerate": "npm:regenerate@1.3.1",
          "regjsgen": "npm:regjsgen@0.2.0"
        }
      },
      "npm:regjsparser@0.1.5": {
        "map": {
          "jsesc": "npm:jsesc@0.5.0"
        }
      },
      "npm:babel-core@6.13.2": {
        "map": {
          "babel-code-frame": "npm:babel-code-frame@6.11.0",
          "babel-messages": "npm:babel-messages@6.8.0",
          "babel-template": "npm:babel-template@6.9.0",
          "babel-runtime": "npm:babel-runtime@6.11.6",
          "babel-traverse": "npm:babel-traverse@6.13.0",
          "babel-types": "npm:babel-types@6.13.0",
          "babylon": "npm:babylon@6.8.4",
          "debug": "npm:debug@2.2.0",
          "private": "npm:private@0.1.6",
          "lodash": "npm:lodash@4.15.0",
          "babel-register": "npm:babel-register@6.11.6",
          "slash": "npm:slash@1.0.0",
          "path-exists": "npm:path-exists@1.0.0",
          "shebang-regex": "npm:shebang-regex@1.0.0",
          "path-is-absolute": "npm:path-is-absolute@1.0.0",
          "convert-source-map": "npm:convert-source-map@1.3.0",
          "babel-generator": "npm:babel-generator@6.11.4",
          "minimatch": "npm:minimatch@3.0.3",
          "source-map": "npm:source-map@0.5.6",
          "json5": "npm:json5@0.4.0",
          "babel-helpers": "npm:babel-helpers@6.8.0"
        }
      },
      "npm:babel-register@6.11.6": {
        "map": {
          "babel-runtime": "npm:babel-runtime@6.11.6",
          "babel-core": "npm:babel-core@6.13.2",
          "core-js": "npm:core-js@2.4.1",
          "lodash": "npm:lodash@4.15.0",
          "path-exists": "npm:path-exists@1.0.0",
          "home-or-tmp": "npm:home-or-tmp@1.0.0",
          "mkdirp": "npm:mkdirp@0.5.1",
          "source-map-support": "npm:source-map-support@0.2.10"
        }
      },
      "npm:babel-generator@6.11.4": {
        "map": {
          "babel-messages": "npm:babel-messages@6.8.0",
          "babel-runtime": "npm:babel-runtime@6.11.6",
          "babel-types": "npm:babel-types@6.13.0",
          "lodash": "npm:lodash@4.15.0",
          "source-map": "npm:source-map@0.5.6",
          "detect-indent": "npm:detect-indent@3.0.1"
        }
      },
      "npm:babel-helpers@6.8.0": {
        "map": {
          "babel-runtime": "npm:babel-runtime@6.11.6",
          "babel-template": "npm:babel-template@6.9.0"
        }
      },
      "npm:minimatch@3.0.3": {
        "map": {
          "brace-expansion": "npm:brace-expansion@1.1.6"
        }
      },
      "npm:home-or-tmp@1.0.0": {
        "map": {
          "os-tmpdir": "npm:os-tmpdir@1.0.1",
          "user-home": "npm:user-home@1.1.1"
        }
      },
      "npm:brace-expansion@1.1.6": {
        "map": {
          "concat-map": "npm:concat-map@0.0.1",
          "balanced-match": "npm:balanced-match@0.4.2"
        }
      },
      "npm:detect-indent@3.0.1": {
        "map": {
          "get-stdin": "npm:get-stdin@4.0.1",
          "repeating": "npm:repeating@1.1.3",
          "minimist": "npm:minimist@1.2.0"
        }
      },
      "npm:mkdirp@0.5.1": {
        "map": {
          "minimist": "npm:minimist@0.0.8"
        }
      },
      "npm:repeating@1.1.3": {
        "map": {
          "is-finite": "npm:is-finite@1.0.1"
        }
      },
      "npm:source-map-support@0.2.10": {
        "map": {
          "source-map": "npm:source-map@0.1.32"
        }
      },
      "npm:is-finite@1.0.1": {
        "map": {
          "number-is-nan": "npm:number-is-nan@1.0.0"
        }
      },
      "npm:source-map@0.1.32": {
        "map": {
          "amdefine": "npm:amdefine@1.0.0"
        }
      },
      "npm:readable-stream@2.1.4": {
        "map": {
          "inherits": "npm:inherits@2.0.1",
          "process-nextick-args": "npm:process-nextick-args@1.0.7",
          "buffer-shims": "npm:buffer-shims@1.0.0",
          "core-util-is": "npm:core-util-is@1.0.2",
          "string_decoder": "npm:string_decoder@0.10.31",
          "util-deprecate": "npm:util-deprecate@1.0.2",
          "isarray": "npm:isarray@1.0.0"
        }
      },
      "npm:babylon@6.9.1": {
        "map": {
          "babel-runtime": "npm:babel-runtime@6.11.6"
        }
      },
      "npm:jspm-nodelibs-http@0.2.0": {
        "map": {
          "http-browserify": "npm:stream-http@2.3.1"
        }
      },
      "npm:jspm-nodelibs-url@0.2.0": {
        "map": {
          "url-browserify": "npm:url@0.11.0"
        }
      }
    }
  },
  transpiler: "plugin-babel",
  packages: {
    "single-spa": {
      "main": "single-spa.js",
      "meta": {
        "*.js": {
          "babelOptions": {
            "presets": [
              "babel-preset-stage-3"
            ]
          },
          "loader": "plugin-babel"
        }
      }
    }
  }
});

SystemJS.config({
  packageConfigPaths: [
    "npm:@*/*.json",
    "npm:*.json",
    "github:*/*.json"
  ],
  map: {
    "assert": "npm:jspm-nodelibs-assert@0.2.0",
    "buffer": "npm:jspm-nodelibs-buffer@0.2.0",
    "child_process": "npm:jspm-nodelibs-child_process@0.2.0",
    "constants": "npm:jspm-nodelibs-constants@0.2.0",
    "crypto": "npm:jspm-nodelibs-crypto@0.2.0",
    "events": "npm:jspm-nodelibs-events@0.2.0",
    "fs": "npm:jspm-nodelibs-fs@0.2.0",
    "os": "npm:jspm-nodelibs-os@0.2.0",
    "path": "npm:jspm-nodelibs-path@0.2.0",
    "process": "npm:jspm-nodelibs-process@0.2.0",
    "stream": "npm:jspm-nodelibs-stream@0.2.0",
    "string_decoder": "npm:jspm-nodelibs-string_decoder@0.2.0",
    "util": "npm:jspm-nodelibs-util@0.2.0",
    "vm": "npm:jspm-nodelibs-vm@0.2.0"
  },
  packages: {
    "npm:stream-browserify@2.0.1": {
      "map": {
        "inherits": "npm:inherits@2.0.1",
        "readable-stream": "npm:readable-stream@2.1.5"
      }
    },
    "npm:crypto-browserify@3.11.0": {
      "map": {
        "inherits": "npm:inherits@2.0.1",
        "browserify-cipher": "npm:browserify-cipher@1.0.0",
        "randombytes": "npm:randombytes@2.0.3",
        "public-encrypt": "npm:public-encrypt@4.0.0",
        "create-hash": "npm:create-hash@1.1.2",
        "create-hmac": "npm:create-hmac@1.1.4",
        "pbkdf2": "npm:pbkdf2@3.0.4",
        "create-ecdh": "npm:create-ecdh@4.0.0",
        "browserify-sign": "npm:browserify-sign@4.0.0",
        "diffie-hellman": "npm:diffie-hellman@5.0.2"
      }
    },
    "npm:public-encrypt@4.0.0": {
      "map": {
        "create-hash": "npm:create-hash@1.1.2",
        "randombytes": "npm:randombytes@2.0.3",
        "parse-asn1": "npm:parse-asn1@5.0.0",
        "browserify-rsa": "npm:browserify-rsa@4.0.1",
        "bn.js": "npm:bn.js@4.11.6"
      }
    },
    "npm:create-hash@1.1.2": {
      "map": {
        "inherits": "npm:inherits@2.0.1",
        "ripemd160": "npm:ripemd160@1.0.1",
        "cipher-base": "npm:cipher-base@1.0.2",
        "sha.js": "npm:sha.js@2.4.5"
      }
    },
    "npm:create-hmac@1.1.4": {
      "map": {
        "create-hash": "npm:create-hash@1.1.2",
        "inherits": "npm:inherits@2.0.1"
      }
    },
    "npm:pbkdf2@3.0.4": {
      "map": {
        "create-hmac": "npm:create-hmac@1.1.4"
      }
    },
    "npm:browserify-sign@4.0.0": {
      "map": {
        "inherits": "npm:inherits@2.0.1",
        "create-hash": "npm:create-hash@1.1.2",
        "create-hmac": "npm:create-hmac@1.1.4",
        "parse-asn1": "npm:parse-asn1@5.0.0",
        "elliptic": "npm:elliptic@6.3.1",
        "browserify-rsa": "npm:browserify-rsa@4.0.1",
        "bn.js": "npm:bn.js@4.11.6"
      }
    },
    "npm:diffie-hellman@5.0.2": {
      "map": {
        "randombytes": "npm:randombytes@2.0.3",
        "miller-rabin": "npm:miller-rabin@4.0.0",
        "bn.js": "npm:bn.js@4.11.6"
      }
    },
    "npm:browserify-cipher@1.0.0": {
      "map": {
        "browserify-aes": "npm:browserify-aes@1.0.6",
        "browserify-des": "npm:browserify-des@1.0.0",
        "evp_bytestokey": "npm:evp_bytestokey@1.0.0"
      }
    },
    "npm:browserify-des@1.0.0": {
      "map": {
        "inherits": "npm:inherits@2.0.1",
        "cipher-base": "npm:cipher-base@1.0.2",
        "des.js": "npm:des.js@1.0.0"
      }
    },
    "npm:browserify-aes@1.0.6": {
      "map": {
        "create-hash": "npm:create-hash@1.1.2",
        "inherits": "npm:inherits@2.0.1",
        "evp_bytestokey": "npm:evp_bytestokey@1.0.0",
        "cipher-base": "npm:cipher-base@1.0.2",
        "buffer-xor": "npm:buffer-xor@1.0.3"
      }
    },
    "npm:parse-asn1@5.0.0": {
      "map": {
        "create-hash": "npm:create-hash@1.1.2",
        "pbkdf2": "npm:pbkdf2@3.0.4",
        "browserify-aes": "npm:browserify-aes@1.0.6",
        "evp_bytestokey": "npm:evp_bytestokey@1.0.0",
        "asn1.js": "npm:asn1.js@4.8.0"
      }
    },
    "npm:evp_bytestokey@1.0.0": {
      "map": {
        "create-hash": "npm:create-hash@1.1.2"
      }
    },
    "npm:create-ecdh@4.0.0": {
      "map": {
        "elliptic": "npm:elliptic@6.3.1",
        "bn.js": "npm:bn.js@4.11.6"
      }
    },
    "npm:elliptic@6.3.1": {
      "map": {
        "inherits": "npm:inherits@2.0.1",
        "bn.js": "npm:bn.js@4.11.6",
        "hash.js": "npm:hash.js@1.0.3",
        "brorand": "npm:brorand@1.0.5"
      }
    },
    "npm:cipher-base@1.0.2": {
      "map": {
        "inherits": "npm:inherits@2.0.1"
      }
    },
    "npm:browserify-rsa@4.0.1": {
      "map": {
        "randombytes": "npm:randombytes@2.0.3",
        "bn.js": "npm:bn.js@4.11.6"
      }
    },
    "npm:des.js@1.0.0": {
      "map": {
        "inherits": "npm:inherits@2.0.1",
        "minimalistic-assert": "npm:minimalistic-assert@1.0.0"
      }
    },
    "npm:sha.js@2.4.5": {
      "map": {
        "inherits": "npm:inherits@2.0.1"
      }
    },
    "npm:miller-rabin@4.0.0": {
      "map": {
        "bn.js": "npm:bn.js@4.11.6",
        "brorand": "npm:brorand@1.0.5"
      }
    },
    "npm:asn1.js@4.8.0": {
      "map": {
        "inherits": "npm:inherits@2.0.1",
        "bn.js": "npm:bn.js@4.11.6",
        "minimalistic-assert": "npm:minimalistic-assert@1.0.0"
      }
    },
    "npm:hash.js@1.0.3": {
      "map": {
        "inherits": "npm:inherits@2.0.1"
      }
    },
    "npm:readable-stream@2.1.5": {
      "map": {
        "inherits": "npm:inherits@2.0.1",
        "core-util-is": "npm:core-util-is@1.0.2",
        "isarray": "npm:isarray@1.0.0",
        "buffer-shims": "npm:buffer-shims@1.0.0",
        "process-nextick-args": "npm:process-nextick-args@1.0.7",
        "string_decoder": "npm:string_decoder@0.10.31",
        "util-deprecate": "npm:util-deprecate@1.0.2"
      }
    },
    "npm:buffer@4.9.1": {
      "map": {
        "isarray": "npm:isarray@1.0.0",
        "ieee754": "npm:ieee754@1.1.6",
        "base64-js": "npm:base64-js@1.1.2"
      }
    },
    "npm:jspm-nodelibs-buffer@0.2.0": {
      "map": {
        "buffer-browserify": "npm:buffer@4.9.1"
      }
    },
    "npm:jspm-nodelibs-crypto@0.2.0": {
      "map": {
        "crypto-browserify": "npm:crypto-browserify@3.11.0"
      }
    },
    "npm:jspm-nodelibs-stream@0.2.0": {
      "map": {
        "stream-browserify": "npm:stream-browserify@2.0.1"
      }
    },
    "npm:jspm-nodelibs-string_decoder@0.2.0": {
      "map": {
        "string_decoder-browserify": "npm:string_decoder@0.10.31"
      }
    },
    "npm:jspm-nodelibs-os@0.2.0": {
      "map": {
        "os-browserify": "npm:os-browserify@0.2.1"
      }
    }
  }
});
