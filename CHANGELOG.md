# Changelog

## 7.0.0-beta.4

### Patch Changes

- [#1304](https://github.com/single-spa/single-spa/pull/1304) [`6d02602`](https://github.com/single-spa/single-spa/commit/6d026022a2ca471ee06038b17e2dcfeb425baf02) Thanks [@jolyndenning](https://github.com/jolyndenning)! - Make StartOpts optional when calling start()

## 7.0.0-beta.3

### Minor Changes

- [#1300](https://github.com/single-spa/single-spa/pull/1300) [`2c45f70`](https://github.com/single-spa/single-spa/commit/2c45f707e2b546ef2bdd3c0d6039f6a7c9ff423c) Thanks [@jolyndenning](https://github.com/jolyndenning)! - Export StartOpts type

## 7.0.0-beta.2

### Minor Changes

- [#1294](https://github.com/single-spa/single-spa/pull/1294) [`bbacc60`](https://github.com/single-spa/single-spa/commit/bbacc601192b0db85c96477696880e733ff6776c) Thanks [@jolyndenning](https://github.com/jolyndenning)! - Export additional types for lifecycles

## 7.0.0-beta.1

### Major Changes

- [#1262](https://github.com/single-spa/single-spa/pull/1262) [`08e71ef`](https://github.com/single-spa/single-spa/commit/08e71efd3fd43d4601875da498fca6f2a1769473) Thanks [@joeldenning](https://github.com/joeldenning)! - Change main to ESM, types to ESM, and remove deprecated module field

- [#1260](https://github.com/single-spa/single-spa/pull/1260) [`c4d0993`](https://github.com/single-spa/single-spa/commit/c4d099375078740af4ea3f96688f492b38cee969) Thanks [@MilanKovacic](https://github.com/MilanKovacic)! - Fix package exports/types

## 7.0.0-beta.0

### Major Changes

- [#1186](https://github.com/single-spa/single-spa/pull/1186) [`a061710`](https://github.com/single-spa/single-spa/commit/a061710d54228c03dab6a61be644ea2d2786b49e) Thanks [@joeldenning](https://github.com/joeldenning)! - Begin migration to typescript

  WHAT: single-spa@6 was implemented in Javascript, with additional hand-crafted typescript declaration files. single-spa@7 is now implemented in Typescript. The typescript interfaces, types, etc changed somewhat during the migration. single-spa's package.json now includes typescript definitions in the `"exports"` field.

  WHY: The single-spa core team hopes to migrate most single-spa projects to typescript, for type safety.

  HOW: JS-only users of single-spa can safely upgrade without any changes. Typescript users will notice that some of the exported types are no longer available, modified, or renamed. See the rest of the changelog for exact descriptions of which types have changed. We encourage single-spa's typescript users to use the [Parameters](https://www.typescriptlang.org/docs/handbook/utility-types.html#parameterstype) utility type to access function argument types that previously were exported.

- [#1230](https://github.com/single-spa/single-spa/pull/1230) [`66c7f33`](https://github.com/single-spa/single-spa/commit/66c7f3376559ada5eede826c479fe08c221b955d) Thanks [@joeldenning](https://github.com/joeldenning)! - Update package.json entry points

  The `"module"` and `"typings"` fields have been removed from the package.json, in favor of the `"exports"` field only.

- [#1216](https://github.com/single-spa/single-spa/pull/1216) [`45255a9`](https://github.com/single-spa/single-spa/commit/45255a967b1f65e3f8c283b8e5cc7db31ca81948) Thanks [@joeldenning](https://github.com/joeldenning)! - Drop IE11 support. Change browserslist target

- [#1230](https://github.com/single-spa/single-spa/pull/1230) [`66c7f33`](https://github.com/single-spa/single-spa/commit/66c7f3376559ada5eede826c479fe08c221b955d) Thanks [@joeldenning](https://github.com/joeldenning)! - Remove different builds for ES5 versus ES2015

- [#1216](https://github.com/single-spa/single-spa/pull/1216) [`45255a9`](https://github.com/single-spa/single-spa/commit/45255a967b1f65e3f8c283b8e5cc7db31ca81948) Thanks [@joeldenning](https://github.com/joeldenning)! - remove es2015 and es5 folders from published tarball

### Minor Changes

- [#1254](https://github.com/single-spa/single-spa/pull/1254) [`4992efe`](https://github.com/single-spa/single-spa/commit/4992efe339739c44f6516e354de28a9fe54b1857) Thanks [@joeldenning](https://github.com/joeldenning)! - Allow unloading applications in SKIP_BECAUSE_BROKEN status

- [#1199](https://github.com/single-spa/single-spa/pull/1199) [`b1fbbca`](https://github.com/single-spa/single-spa/commit/b1fbbcab86bb05e5af63aa58ee885bf849031974) Thanks [@joeldenning](https://github.com/joeldenning)! - Migrate applications folder to typescript

- [#1202](https://github.com/single-spa/single-spa/pull/1202) [`a00b0df`](https://github.com/single-spa/single-spa/commit/a00b0df81b9b35b09d0b153c05f461cf83b54581) Thanks [@joeldenning](https://github.com/joeldenning)! - Migrate navigation folder to typescript

- [#1196](https://github.com/single-spa/single-spa/pull/1196) [`a52a3e4`](https://github.com/single-spa/single-spa/commit/a52a3e41314011aeb6a933790555ee6537a4e530) Thanks [@joeldenning](https://github.com/joeldenning)! - Migrate devtools to typescript

- [#1210](https://github.com/single-spa/single-spa/pull/1210) [`d717968`](https://github.com/single-spa/single-spa/commit/d71796847e55bd71743dd75e75caf3927b39c8b1) Thanks [@joeldenning](https://github.com/joeldenning)! - Migrate lifecycles folder to typescript

### Patch Changes

- [#1213](https://github.com/single-spa/single-spa/pull/1213) [`65a71b9`](https://github.com/single-spa/single-spa/commit/65a71b9062c6ecb438c2af97af5d11ebc88089a4) Thanks [@joeldenning](https://github.com/joeldenning)! - Change test files to .ts extension

- [#1210](https://github.com/single-spa/single-spa/pull/1210) [`d717968`](https://github.com/single-spa/single-spa/commit/d71796847e55bd71743dd75e75caf3927b39c8b1) Thanks [@joeldenning](https://github.com/joeldenning)! - Update eslint config for typescript

## 6.0.3

### Patch Changes

- [#1256](https://github.com/single-spa/single-spa/pull/1256) [`205d020`](https://github.com/single-spa/single-spa/commit/205d02018c10887efd01826cd6e54884d81c152f) Thanks [@joeldenning](https://github.com/joeldenning)! - Upgrade rollup to avoid security vulnerability

## 6.0.2

### Patch Changes

- [#1227](https://github.com/single-spa/single-spa/pull/1227) [`f5df9ca`](https://github.com/single-spa/single-spa/commit/f5df9ca1e58c389d2c24dd1b84a92bbc3ece3c11) Thanks [@HighSkySky](https://github.com/HighSkySky)! - Always call native window.removeEventListener

## 6.0.1

### Patch Changes

- [#1169](https://github.com/single-spa/single-spa/pull/1169) [`f22be6b`](https://github.com/single-spa/single-spa/commit/f22be6b8d34a1596b58f0701e353d869d11d4e17) Thanks [@joeldenning](https://github.com/joeldenning)! - Implement unregisterApplication server-side

- [#1201](https://github.com/single-spa/single-spa/pull/1201) [`1df36db`](https://github.com/single-spa/single-spa/commit/1df36db508d58a27669cf8920f6c483646762a2b) Thanks [@MilanKovacic](https://github.com/MilanKovacic)! - Fix issue with missing types when using module resolution strategies other than node10

See https://github.com/single-spa/single-spa/releases for what has changed in each version of single-spa.
