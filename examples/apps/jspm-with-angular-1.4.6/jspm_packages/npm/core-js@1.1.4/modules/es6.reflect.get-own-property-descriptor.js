/* */ 
var $ = require("./$"),
    $def = require("./$.def"),
    anObject = require("./$.an-object");
$def($def.S, 'Reflect', {getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, propertyKey) {
    return $.getDesc(anObject(target), propertyKey);
  }});
