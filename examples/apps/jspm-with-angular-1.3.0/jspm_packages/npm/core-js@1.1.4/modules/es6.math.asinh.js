/* */ 
var $def = require("./$.def");
function asinh(x) {
  return !isFinite(x = +x) || x == 0 ? x : x < 0 ? -asinh(-x) : Math.log(x + Math.sqrt(x * x + 1));
}
$def($def.S, 'Math', {asinh: asinh});
