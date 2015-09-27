/* */ 
var global = require("./$.global"),
    core = require("./$.core"),
    $def = require("./$.def"),
    partial = require("./$.partial");
$def($def.G + $def.F, {delay: function delay(time) {
    return new (core.Promise || global.Promise)(function(resolve) {
      setTimeout(partial.call(resolve, true), time);
    });
  }});
