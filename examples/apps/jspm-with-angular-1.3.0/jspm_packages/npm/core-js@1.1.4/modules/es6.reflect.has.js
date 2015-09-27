/* */ 
var $def = require("./$.def");
$def($def.S, 'Reflect', {has: function has(target, propertyKey) {
    return propertyKey in target;
  }});
