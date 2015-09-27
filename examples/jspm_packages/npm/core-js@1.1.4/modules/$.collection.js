/* */ 
'use strict';
var global = require("./$.global"),
    $def = require("./$.def"),
    forOf = require("./$.for-of"),
    strictNew = require("./$.strict-new");
module.exports = function(NAME, wrapper, methods, common, IS_MAP, IS_WEAK) {
  var Base = global[NAME],
      C = Base,
      ADDER = IS_MAP ? 'set' : 'add',
      proto = C && C.prototype,
      O = {};
  var fixMethod = function(KEY) {
    var fn = proto[KEY];
    require("./$.redef")(proto, KEY, KEY == 'delete' ? function(a) {
      return fn.call(this, a === 0 ? 0 : a);
    } : KEY == 'has' ? function has(a) {
      return fn.call(this, a === 0 ? 0 : a);
    } : KEY == 'get' ? function get(a) {
      return fn.call(this, a === 0 ? 0 : a);
    } : KEY == 'add' ? function add(a) {
      fn.call(this, a === 0 ? 0 : a);
      return this;
    } : function set(a, b) {
      fn.call(this, a === 0 ? 0 : a, b);
      return this;
    });
  };
  if (typeof C != 'function' || !(IS_WEAK || proto.forEach && !require("./$.fails")(function() {
    new C().entries().next();
  }))) {
    C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
    require("./$.mix")(C.prototype, methods);
  } else {
    var inst = new C,
        chain = inst[ADDER](IS_WEAK ? {} : -0, 1),
        buggyZero;
    if (!require("./$.iter-detect")(function(iter) {
      new C(iter);
    })) {
      C = wrapper(function(target, iterable) {
        strictNew(target, C, NAME);
        var that = new Base;
        if (iterable != undefined)
          forOf(iterable, IS_MAP, that[ADDER], that);
        return that;
      });
      C.prototype = proto;
      proto.constructor = C;
    }
    IS_WEAK || inst.forEach(function(val, key) {
      buggyZero = 1 / key === -Infinity;
    });
    if (buggyZero) {
      fixMethod('delete');
      fixMethod('has');
      IS_MAP && fixMethod('get');
    }
    if (buggyZero || chain !== inst)
      fixMethod(ADDER);
    if (IS_WEAK && proto.clear)
      delete proto.clear;
  }
  require("./$.tag")(C, NAME);
  O[NAME] = C;
  $def($def.G + $def.W + $def.F * (C != Base), O);
  if (!IS_WEAK)
    common.setStrong(C, NAME, IS_MAP);
  return C;
};
