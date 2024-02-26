// A single declaration file CAN NOT represent both CommonJS and ESM module, even if their content is identical.
// See https://github.com/arethetypeswrong/arethetypeswrong.github.io/blob/main/docs/problems/FalseESM.md#common-causes for more information.

import { copyFileSync } from "fs";

const esmTypesFile = "typings/single-spa.d.ts";
const cjsTypesFile = "typings/single-spa.d.cts";

copyFileSync(esmTypesFile, cjsTypesFile);

// eslint-disable-next-line no-console
console.log(`Copied ${esmTypesFile} to ${cjsTypesFile}`);
