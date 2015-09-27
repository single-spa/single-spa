/* */ 
'use strict';
var $def = require("./$.def"),
    toLength = require("./$.to-length"),
    context = require("./$.string-context");
$def($def.P + $def.F * !require("./$.fails")(function() {
  'q'.startsWith(/./);
}), 'String', {startsWith: function startsWith(searchString) {
    var that = context(this, searchString, 'startsWith'),
        index = toLength(Math.min(arguments[1], that.length)),
        search = String(searchString);
    return that.slice(index, index + search.length) === search;
  }});
