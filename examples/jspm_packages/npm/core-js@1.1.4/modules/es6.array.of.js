/* */ 
'use strict';
var $def = require("./$.def");
$def($def.S + $def.F * require("./$.fails")(function() {
  function F() {}
  return !(Array.of.call(F) instanceof F);
}), 'Array', {of: function of() {
    var index = 0,
        length = arguments.length,
        result = new (typeof this == 'function' ? this : Array)(length);
    while (length > index)
      result[index] = arguments[index++];
    result.length = length;
    return result;
  }});
