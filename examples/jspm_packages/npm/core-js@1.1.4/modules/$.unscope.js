/* */ 
var UNSCOPABLES = require("./$.wks")('unscopables');
if (!(UNSCOPABLES in []))
  require("./$.hide")(Array.prototype, UNSCOPABLES, {});
module.exports = function(key) {
  [][UNSCOPABLES][key] = true;
};
