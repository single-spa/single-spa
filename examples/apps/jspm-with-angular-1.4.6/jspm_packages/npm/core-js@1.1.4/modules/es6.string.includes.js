/* */ 
'use strict';
var $def = require("./$.def"),
    context = require("./$.string-context");
$def($def.P, 'String', {includes: function includes(searchString) {
    return !!~context(this, searchString, 'includes').indexOf(searchString, arguments[1]);
  }});
