/* */ 
'use strict';
var path = require("./$.path"),
    $def = require("./$.def");
require("./$.core")._ = path._ = path._ || {};
$def($def.P + $def.F, 'Function', {part: require("./$.partial")});
