/* */ 
var $def = require("./$.def");
$def($def.S, 'Number', {isNaN: function isNaN(number) {
    return number != number;
  }});
