/* */ 
var $def = require("./$.def"),
    getProto = require("./$").getProto,
    anObject = require("./$.an-object");
$def($def.S, 'Reflect', {getPrototypeOf: function getPrototypeOf(target) {
    return getProto(anObject(target));
  }});
