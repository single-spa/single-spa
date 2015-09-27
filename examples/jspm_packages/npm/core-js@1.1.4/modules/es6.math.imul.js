/* */ 
var $def = require("./$.def");
$def($def.S + $def.F * require("./$.fails")(function() {
  return Math.imul(0xffffffff, 5) != -5;
}), 'Math', {imul: function imul(x, y) {
    var UINT16 = 0xffff,
        xn = +x,
        yn = +y,
        xl = UINT16 & xn,
        yl = UINT16 & yn;
    return 0 | xl * yl + ((UINT16 & xn >>> 16) * yl + xl * (UINT16 & yn >>> 16) << 16 >>> 0);
  }});
