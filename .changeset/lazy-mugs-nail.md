---
"single-spa": major
---

Begin migration to typescript

WHAT: single-spa@6 was implemented in Javascript, with additional hand-crafted typescript declaration files. single-spa@7 is now implemented in Typescript. The typescript interfaces, types, etc changed somewhat during the migration. single-spa's package.json now includes typescript definitions in the `"exports"` field.

WHY: The single-spa core team hopes to migrate most single-spa projects to typescript, for type safety.

HOW: JS-only users of single-spa can safely upgrade without any changes. Typescript users will notice that some of the exported types are no longer available, modified, or renamed. See the rest of the changelog for exact descriptions of which types have changed. We encourage single-spa's typescript users to use the [Parameters](https://www.typescriptlang.org/docs/handbook/utility-types.html#parameterstype) utility type to access function argument types that previously were exported.
