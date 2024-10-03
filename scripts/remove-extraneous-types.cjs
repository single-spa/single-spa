/**
 * Removes extraneous types left after combining types into a single file using rollup-plugin-dts
 */
const rimraf = require("rimraf");
const path = require("path");

const foldersToRemove = ["../lib/esm/types-tsc", "../lib/umd/types-tsc"];

foldersToRemove.forEach((dir) => {
  const fullPath = path.resolve(__dirname, dir);
  rimraf.sync(fullPath);
  console.log(`Removed: ${fullPath}`);
});
