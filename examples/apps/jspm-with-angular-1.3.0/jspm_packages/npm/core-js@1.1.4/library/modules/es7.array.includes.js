/* */ 
'use strict';
var $def = require("./$.def"),
    $includes = require("./$.array-includes")(true);
$def($def.P, 'Array', {includes: function includes(el) {
    return $includes(this, el, arguments[1]);
  }});
require("./$.unscope")('includes');
