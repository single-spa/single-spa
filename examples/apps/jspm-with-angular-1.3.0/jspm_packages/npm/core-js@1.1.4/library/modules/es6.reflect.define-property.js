/* */ 
var $ = require("./$"),
    $def = require("./$.def"),
    anObject = require("./$.an-object");
$def($def.S + $def.F * require("./$.fails")(function() {
  Reflect.defineProperty($.setDesc({}, 1, {value: 1}), 1, {value: 2});
}), 'Reflect', {defineProperty: function defineProperty(target, propertyKey, attributes) {
    anObject(target);
    try {
      $.setDesc(target, propertyKey, attributes);
      return true;
    } catch (e) {
      return false;
    }
  }});
