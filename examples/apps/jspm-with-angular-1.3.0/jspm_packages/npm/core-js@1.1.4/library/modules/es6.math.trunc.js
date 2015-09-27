/* */ 
var $def = require("./$.def");
$def($def.S, 'Math', {trunc: function trunc(it) {
    return (it > 0 ? Math.floor : Math.ceil)(it);
  }});
