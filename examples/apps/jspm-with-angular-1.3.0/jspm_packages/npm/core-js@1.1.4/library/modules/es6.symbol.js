/* */ 
'use strict';
var $ = require("./$"),
    global = require("./$.global"),
    has = require("./$.has"),
    SUPPORT_DESC = require("./$.support-desc"),
    $def = require("./$.def"),
    $redef = require("./$.redef"),
    shared = require("./$.shared"),
    setTag = require("./$.tag"),
    uid = require("./$.uid"),
    wks = require("./$.wks"),
    keyOf = require("./$.keyof"),
    $names = require("./$.get-names"),
    enumKeys = require("./$.enum-keys"),
    isObject = require("./$.is-object"),
    anObject = require("./$.an-object"),
    toIObject = require("./$.to-iobject"),
    createDesc = require("./$.property-desc"),
    getDesc = $.getDesc,
    setDesc = $.setDesc,
    _create = $.create,
    getNames = $names.get,
    $Symbol = global.Symbol,
    setter = false,
    HIDDEN = wks('_hidden'),
    isEnum = $.isEnum,
    SymbolRegistry = shared('symbol-registry'),
    AllSymbols = shared('symbols'),
    useNative = typeof $Symbol == 'function',
    ObjectProto = Object.prototype;
var setSymbolDesc = SUPPORT_DESC ? function() {
  try {
    return _create(setDesc({}, HIDDEN, {get: function() {
        return setDesc(this, HIDDEN, {value: false})[HIDDEN];
      }}))[HIDDEN] || setDesc;
  } catch (e) {
    return function(it, key, D) {
      var protoDesc = getDesc(ObjectProto, key);
      if (protoDesc)
        delete ObjectProto[key];
      setDesc(it, key, D);
      if (protoDesc && it !== ObjectProto)
        setDesc(ObjectProto, key, protoDesc);
    };
  }
}() : setDesc;
var wrap = function(tag) {
  var sym = AllSymbols[tag] = _create($Symbol.prototype);
  sym._k = tag;
  SUPPORT_DESC && setter && setSymbolDesc(ObjectProto, tag, {
    configurable: true,
    set: function(value) {
      if (has(this, HIDDEN) && has(this[HIDDEN], tag))
        this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, createDesc(1, value));
    }
  });
  return sym;
};
var $defineProperty = function defineProperty(it, key, D) {
  if (D && has(AllSymbols, key)) {
    if (!D.enumerable) {
      if (!has(it, HIDDEN))
        setDesc(it, HIDDEN, createDesc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if (has(it, HIDDEN) && it[HIDDEN][key])
        it[HIDDEN][key] = false;
      D = _create(D, {enumerable: createDesc(0, false)});
    }
    return setSymbolDesc(it, key, D);
  }
  return setDesc(it, key, D);
};
var $defineProperties = function defineProperties(it, P) {
  anObject(it);
  var keys = enumKeys(P = toIObject(P)),
      i = 0,
      l = keys.length,
      key;
  while (l > i)
    $defineProperty(it, key = keys[i++], P[key]);
  return it;
};
var $create = function create(it, P) {
  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
};
var $propertyIsEnumerable = function propertyIsEnumerable(key) {
  var E = isEnum.call(this, key);
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
};
var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
  var D = getDesc(it = toIObject(it), key);
  if (D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key]))
    D.enumerable = true;
  return D;
};
var $getOwnPropertyNames = function getOwnPropertyNames(it) {
  var names = getNames(toIObject(it)),
      result = [],
      i = 0,
      key;
  while (names.length > i)
    if (!has(AllSymbols, key = names[i++]) && key != HIDDEN)
      result.push(key);
  return result;
};
var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
  var names = getNames(toIObject(it)),
      result = [],
      i = 0,
      key;
  while (names.length > i)
    if (has(AllSymbols, key = names[i++]))
      result.push(AllSymbols[key]);
  return result;
};
if (!useNative) {
  $Symbol = function Symbol() {
    if (this instanceof $Symbol)
      throw TypeError('Symbol is not a constructor');
    return wrap(uid(arguments[0]));
  };
  $redef($Symbol.prototype, 'toString', function toString() {
    return this._k;
  });
  $.create = $create;
  $.isEnum = $propertyIsEnumerable;
  $.getDesc = $getOwnPropertyDescriptor;
  $.setDesc = $defineProperty;
  $.setDescs = $defineProperties;
  $.getNames = $names.get = $getOwnPropertyNames;
  $.getSymbols = $getOwnPropertySymbols;
  if (SUPPORT_DESC && !require("./$.library")) {
    $redef(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
  }
}
if (!useNative || require("./$.fails")(function() {
  return JSON.stringify([{a: $Symbol()}, [$Symbol()]]) != '[{},[null]]';
}))
  $redef($Symbol.prototype, 'toJSON', function toJSON() {
    if (useNative && isObject(this))
      return this;
  });
var symbolStatics = {
  'for': function(key) {
    return has(SymbolRegistry, key += '') ? SymbolRegistry[key] : SymbolRegistry[key] = $Symbol(key);
  },
  keyFor: function keyFor(key) {
    return keyOf(SymbolRegistry, key);
  },
  useSetter: function() {
    setter = true;
  },
  useSimple: function() {
    setter = false;
  }
};
$.each.call(('hasInstance,isConcatSpreadable,iterator,match,replace,search,' + 'species,split,toPrimitive,toStringTag,unscopables').split(','), function(it) {
  var sym = wks(it);
  symbolStatics[it] = useNative ? sym : wrap(sym);
});
setter = true;
$def($def.G + $def.W, {Symbol: $Symbol});
$def($def.S, 'Symbol', symbolStatics);
$def($def.S + $def.F * !useNative, 'Object', {
  create: $create,
  defineProperty: $defineProperty,
  defineProperties: $defineProperties,
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
  getOwnPropertyNames: $getOwnPropertyNames,
  getOwnPropertySymbols: $getOwnPropertySymbols
});
setTag($Symbol, 'Symbol');
setTag(Math, 'Math', true);
setTag(global.JSON, 'JSON', true);
