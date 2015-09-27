/* */ 
var $def = require("./$.def"),
    _apply = Function.apply;
$def($def.S, 'Reflect', {apply: function apply(target, thisArgument, argumentsList) {
    return _apply.call(target, thisArgument, argumentsList);
  }});
