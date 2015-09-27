/* */ 
'use strict';
var $def = require("./$.def"),
    $pad = require("./$.string-pad");
$def($def.P, 'String', {padRight: function padRight(maxLength) {
    return $pad(this, maxLength, arguments[1], false);
  }});
