/* */ 
var $ = require("./$");
if (require("./$.support-desc") && /./g.flags != 'g')
  $.setDesc(RegExp.prototype, 'flags', {
    configurable: true,
    get: require("./$.flags")
  });
