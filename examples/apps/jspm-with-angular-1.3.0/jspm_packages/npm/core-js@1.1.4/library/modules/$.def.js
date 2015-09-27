/* */ 
var global = require("./$.global"),
    core = require("./$.core"),
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
      target = isGlobal ? global : type & $def.S ? global[name] : (global[name] || {})[PROTOTYPE],
      exports = isGlobal ? core : core[name] || (core[name] = {});
  if (isGlobal)
    source = name;
  for (key in source) {
    own = !(type & $def.F) && target && key in target;
    if (own && key in exports)
      continue;
    out = own ? target[key] : source[key];
    if (isGlobal && typeof target[key] != 'function')
      exp = source[key];
    else if (type & $def.B && own)
      exp = ctx(out, global);
    else if (type & $def.W && target[key] == out)
      !function(C) {
        exp = function(param) {
          return this instanceof C ? new C(param) : C(param);
        };
        exp[PROTOTYPE] = C[PROTOTYPE];
      }(out);
    else
      exp = isProto && typeof out == 'function' ? ctx(Function.call, out) : out;
    exports[key] = exp;
    if (isProto)
      (exports[PROTOTYPE] || (exports[PROTOTYPE] = {}))[key] = out;
  }
};
$def.F = 1;
$def.G = 2;
$def.S = 4;
$def.P = 8;
$def.B = 16;
$def.W = 32;
module.exports = $def;
