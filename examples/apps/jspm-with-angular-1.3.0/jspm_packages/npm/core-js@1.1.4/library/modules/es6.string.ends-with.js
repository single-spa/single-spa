/* */ 
'use strict';
var $def = require("./$.def"),
    toLength = require("./$.to-length"),
    context = require("./$.string-context");
$def($def.P + $def.F * !require("./$.fails")(function() {
  'q'.endsWith(/./);
}), 'String', {endsWith: function endsWith(searchString) {
    var that = context(this, searchString, 'endsWith'),
        endPosition = arguments[1],
        len = toLength(that.length),
        end = endPosition === undefined ? len : Math.min(toLength(endPosition), len),
        search = String(searchString);
    return that.slice(end - search.length, end) === search;
  }});
