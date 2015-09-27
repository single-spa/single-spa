/* */ 
'use strict';
var $ = require("./$"),
    IteratorPrototype = {};
require("./$.hide")(IteratorPrototype, require("./$.wks")('iterator'), function() {
  return this;
});
module.exports = function(Constructor, NAME, next) {
  Constructor.prototype = $.create(IteratorPrototype, {next: require("./$.property-desc")(1, next)});
  require("./$.tag")(Constructor, NAME + ' Iterator');
};
