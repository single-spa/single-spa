/* */ 
'use strict';
var ctx = require("./$.ctx"),
    $def = require("./$.def"),
    toObject = require("./$.to-object"),
    call = require("./$.iter-call"),
    isArrayIter = require("./$.is-array-iter"),
    toLength = require("./$.to-length"),
    getIterFn = require("./core.get-iterator-method");
$def($def.S + $def.F * !require("./$.iter-detect")(function(iter) {
  Array.from(iter);
}), 'Array', {from: function from(arrayLike) {
    var O = toObject(arrayLike),
        C = typeof this == 'function' ? this : Array,
        mapfn = arguments[1],
        mapping = mapfn !== undefined,
        index = 0,
        iterFn = getIterFn(O),
        length,
        result,
        step,
        iterator;
    if (mapping)
      mapfn = ctx(mapfn, arguments[2], 2);
    if (iterFn != undefined && !(C == Array && isArrayIter(iterFn))) {
      for (iterator = iterFn.call(O), result = new C; !(step = iterator.next()).done; index++) {
        result[index] = mapping ? call(iterator, mapfn, [step.value, index], true) : step.value;
      }
    } else {
      for (result = new C(length = toLength(O.length)); length > index; index++) {
        result[index] = mapping ? mapfn(O[index], index) : O[index];
      }
    }
    result.length = index;
    return result;
  }});
