/* */ 
var global = require("./$.global"),
    core = require("./$.core"),
    hide = require("./$.hide"),
    $redef = require("./$.redef"),
    PROTOTYPE = 'prototype';
var ctx = function(fn, that) {
  return function() {
    return fn.apply(that, arguments);
  };
};
var $def = function(type, name, source) {
  var key,
      own,
      out,
      exp,
      isGlobal = type & $def.G,
      isProto = type & $def.P,
      target = isGlobal ? global : type & $def.S ? global[name] || (global[name] = {}) : (global[name] || {})[PROTOTYPE],
      exports = isGlobal ? core : core[name] || (core[name] = {});
  if (isGlobal)
    source = name;
  for (key in source) {
    own = !(type & $def.F) && target && key in target;
    out = (own ? target : source)[key];
    if (type & $def.B && own)
      exp = ctx(out, global);
    else
      exp = isProto && typeof out == 'function' ? ctx(Function.call, out) : out;
    if (target && !own)
      $redef(target, key, out);
    if (exports[key] != out)
      hide(exports, key, exp);
    if (isProto)
      (exports[PROTOTYPE] || (exports[PROTOTYPE] = {}))[key] = out;
  }
};
global.core = core;
$def.F = 1;
$def.G = 2;
$def.S = 4;
$def.P = 8;
$def.B = 16;
$def.W = 32;
module.exports = $def;
