/* */ 
'use strict';
var $def = require("./$.def"),
    $at = require("./$.string-at")(false);
$def($def.P, 'String', {codePointAt: function codePointAt(pos) {
    return $at(this, pos);
  }});
