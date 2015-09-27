/* */ 
'use strict';
var $def = require("./$.def"),
    $at = require("./$.string-at")(true);
$def($def.P, 'String', {at: function at(pos) {
    return $at(this, pos);
  }});
