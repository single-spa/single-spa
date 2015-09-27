/* */ 
'use strict';
var KEY = 'findIndex',
    $def = require("./$.def"),
    forced = true,
    $find = require("./$.array-methods")(6);
if (KEY in [])
  Array(1)[KEY](function() {
    forced = false;
  });
$def($def.P + $def.F * forced, 'Array', {findIndex: function findIndex(callbackfn) {
    return $find(this, callbackfn, arguments[1]);
  }});
require("./$.unscope")(KEY);
