/* */ 
'use strict';
var KEY = 'find',
    $def = require("./$.def"),
    forced = true,
    $find = require("./$.array-methods")(5);
if (KEY in [])
  Array(1)[KEY](function() {
    forced = false;
  });
$def($def.P + $def.F * forced, 'Array', {find: function find(callbackfn) {
    return $find(this, callbackfn, arguments[1]);
  }});
require("./$.unscope")(KEY);
