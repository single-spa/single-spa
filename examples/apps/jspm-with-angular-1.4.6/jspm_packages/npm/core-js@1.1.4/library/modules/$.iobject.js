/* */ 
var cof = require("./$.cof");
module.exports = 0 in Object('z') ? Object : function(it) {
  return cof(it) == 'String' ? it.split('') : Object(it);
};
