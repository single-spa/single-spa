/* */ 
var global = require("./$.global"),
    $def = require("./$.def"),
    invoke = require("./$.invoke"),
    partial = require("./$.partial"),
    navigator = global.navigator,
    MSIE = !!navigator && /MSIE .\./.test(navigator.userAgent);
var wrap = function(set) {
  return MSIE ? function(fn, time) {
    return set(invoke(partial, [].slice.call(arguments, 2), typeof fn == 'function' ? fn : Function(fn)), time);
  } : set;
};
$def($def.G + $def.B + $def.F * MSIE, {
  setTimeout: wrap(global.setTimeout),
  setInterval: wrap(global.setInterval)
});
