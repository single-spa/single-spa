/* */ 
(function(process) {
  'use strict';
  var $ = require("./$"),
      LIBRARY = require("./$.library"),
      global = require("./$.global"),
      ctx = require("./$.ctx"),
      classof = require("./$.classof"),
      $def = require("./$.def"),
      isObject = require("./$.is-object"),
      anObject = require("./$.an-object"),
      aFunction = require("./$.a-function"),
      strictNew = require("./$.strict-new"),
      forOf = require("./$.for-of"),
      setProto = require("./$.set-proto").set,
      same = require("./$.same"),
      species = require("./$.species"),
      SPECIES = require("./$.wks")('species'),
      RECORD = require("./$.uid")('record'),
      asap = require("./$.microtask"),
      PROMISE = 'Promise',
      process = global.process,
      isNode = classof(process) == 'process',
      P = global[PROMISE],
      Wrapper;
  var testResolve = function(sub) {
    var test = new P(function() {});
    if (sub)
      test.constructor = Object;
    return P.resolve(test) === test;
  };
  var useNative = function() {
    var works = false;
    function P2(x) {
      var self = new P(x);
      setProto(self, P2.prototype);
      return self;
    }
    try {
      works = P && P.resolve && testResolve();
      setProto(P2, P);
      P2.prototype = $.create(P.prototype, {constructor: {value: P2}});
      if (!(P2.resolve(5).then(function() {}) instanceof P2)) {
        works = false;
      }
      if (works && require("./$.support-desc")) {
        var thenableThenGotten = false;
        P.resolve($.setDesc({}, 'then', {get: function() {
            thenableThenGotten = true;
          }}));
        works = thenableThenGotten;
      }
    } catch (e) {
      works = false;
    }
    return works;
  }();
  var isPromise = function(it) {
    return isObject(it) && (useNative ? classof(it) == 'Promise' : RECORD in it);
  };
  var sameConstructor = function(a, b) {
    if (LIBRARY && a === P && b === Wrapper)
      return true;
    return same(a, b);
  };
  var getConstructor = function(C) {
    var S = anObject(C)[SPECIES];
    return S != undefined ? S : C;
  };
  var isThenable = function(it) {
    var then;
    return isObject(it) && typeof(then = it.then) == 'function' ? then : false;
  };
  var notify = function(record, isReject) {
    if (record.n)
      return;
    record.n = true;
    var chain = record.c;
    asap(function() {
      var value = record.v,
          ok = record.s == 1,
          i = 0;
      var run = function(react) {
        var cb = ok ? react.ok : react.fail,
            ret,
            then;
        try {
          if (cb) {
            if (!ok)
              record.h = true;
            ret = cb === true ? value : cb(value);
            if (ret === react.P) {
              react.rej(TypeError('Promise-chain cycle'));
            } else if (then = isThenable(ret)) {
              then.call(ret, react.res, react.rej);
            } else
              react.res(ret);
          } else
            react.rej(value);
        } catch (err) {
          react.rej(err);
        }
      };
      while (chain.length > i)
        run(chain[i++]);
      chain.length = 0;
      record.n = false;
      if (isReject)
        setTimeout(function() {
          if (isUnhandled(record.p)) {
            if (isNode) {
              process.emit('unhandledRejection', value, record.p);
            } else if (global.console && console.error) {
              console.error('Unhandled promise rejection', value);
            }
          }
          record.a = undefined;
        }, 1);
    });
  };
  var isUnhandled = function(promise) {
    var record = promise[RECORD],
        chain = record.a || record.c,
        i = 0,
        react;
    if (record.h)
      return false;
    while (chain.length > i) {
      react = chain[i++];
      if (react.fail || !isUnhandled(react.P))
        return false;
    }
    return true;
  };
  var $reject = function(value) {
    var record = this;
    if (record.d)
      return;
    record.d = true;
    record = record.r || record;
    record.v = value;
    record.s = 2;
    record.a = record.c.slice();
    notify(record, true);
  };
  var $resolve = function(value) {
    var record = this,
        then;
    if (record.d)
      return;
    record.d = true;
    record = record.r || record;
    try {
      if (then = isThenable(value)) {
        asap(function() {
          var wrapper = {
            r: record,
            d: false
          };
          try {
            then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
          } catch (e) {
            $reject.call(wrapper, e);
          }
        });
      } else {
        record.v = value;
        record.s = 1;
        notify(record, false);
      }
    } catch (e) {
      $reject.call({
        r: record,
        d: false
      }, e);
    }
  };
  if (!useNative) {
    P = function Promise(executor) {
      aFunction(executor);
      var record = {
        p: strictNew(this, P, PROMISE),
        c: [],
        a: undefined,
        s: 0,
        d: false,
        v: undefined,
        h: false,
        n: false
      };
      this[RECORD] = record;
      try {
        executor(ctx($resolve, record, 1), ctx($reject, record, 1));
      } catch (err) {
        $reject.call(record, err);
      }
    };
    require("./$.mix")(P.prototype, {
      then: function then(onFulfilled, onRejected) {
        var S = anObject(anObject(this).constructor)[SPECIES];
        var react = {
          ok: typeof onFulfilled == 'function' ? onFulfilled : true,
          fail: typeof onRejected == 'function' ? onRejected : false
        };
        var promise = react.P = new (S != undefined ? S : P)(function(res, rej) {
          react.res = aFunction(res);
          react.rej = aFunction(rej);
        });
        var record = this[RECORD];
        record.c.push(react);
        if (record.a)
          record.a.push(react);
        if (record.s)
          notify(record, false);
        return promise;
      },
      'catch': function(onRejected) {
        return this.then(undefined, onRejected);
      }
    });
  }
  $def($def.G + $def.W + $def.F * !useNative, {Promise: P});
  require("./$.tag")(P, PROMISE);
  species(P);
  species(Wrapper = require("./$.core")[PROMISE]);
  $def($def.S + $def.F * !useNative, PROMISE, {reject: function reject(r) {
      return new this(function(res, rej) {
        rej(r);
      });
    }});
  $def($def.S + $def.F * (!useNative || testResolve(true)), PROMISE, {resolve: function resolve(x) {
      return isPromise(x) && sameConstructor(x.constructor, this) ? x : new this(function(res) {
        res(x);
      });
    }});
  $def($def.S + $def.F * !(useNative && require("./$.iter-detect")(function(iter) {
    P.all(iter)['catch'](function() {});
  })), PROMISE, {
    all: function all(iterable) {
      var C = getConstructor(this),
          values = [];
      return new C(function(res, rej) {
        forOf(iterable, false, values.push, values);
        var remaining = values.length,
            results = Array(remaining);
        if (remaining)
          $.each.call(values, function(promise, index) {
            C.resolve(promise).then(function(value) {
              results[index] = value;
              --remaining || res(results);
            }, rej);
          });
        else
          res(results);
      });
    },
    race: function race(iterable) {
      var C = getConstructor(this);
      return new C(function(res, rej) {
        forOf(iterable, false, function(promise) {
          C.resolve(promise).then(res, rej);
        });
      });
    }
  });
})(require("process"));
