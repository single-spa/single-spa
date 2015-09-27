/* */ 
'use strict';
module.exports = function(KEY, length, exec) {
  var defined = require("./$.defined"),
      SYMBOL = require("./$.wks")(KEY),
      original = ''[KEY];
  if (require("./$.fails")(function() {
    var O = {};
    O[SYMBOL] = function() {
      return 7;
    };
    return ''[KEY](O) != 7;
  })) {
    require("./$.redef")(String.prototype, KEY, exec(defined, SYMBOL, original));
    require("./$.hide")(RegExp.prototype, SYMBOL, length == 2 ? function(string, arg) {
      return original.call(string, this, arg);
    } : function(string) {
      return original.call(string, this);
    });
  }
};
