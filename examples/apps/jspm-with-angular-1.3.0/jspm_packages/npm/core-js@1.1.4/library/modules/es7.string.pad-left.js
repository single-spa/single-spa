/* */ 
'use strict';
var $def = require("./$.def"),
    $pad = require("./$.string-pad");
$def($def.P, 'String', {padLeft: function padLeft(maxLength) {
    return $pad(this, maxLength, arguments[1], true);
  }});
