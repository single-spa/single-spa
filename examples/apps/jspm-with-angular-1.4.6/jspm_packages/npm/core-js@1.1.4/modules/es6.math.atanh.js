/* */ 
var $def = require("./$.def");
$def($def.S, 'Math', {atanh: function atanh(x) {
    return (x = +x) == 0 ? x : Math.log((1 + x) / (1 - x)) / 2;
  }});
