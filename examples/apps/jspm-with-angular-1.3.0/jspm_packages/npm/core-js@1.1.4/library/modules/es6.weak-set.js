/* */ 
'use strict';
var weak = require("./$.collection-weak");
require("./$.collection")('WeakSet', function(get) {
  return function WeakSet() {
    return get(this, arguments[0]);
  };
}, {add: function add(value) {
    return weak.def(this, value, true);
  }}, weak, false, true);
