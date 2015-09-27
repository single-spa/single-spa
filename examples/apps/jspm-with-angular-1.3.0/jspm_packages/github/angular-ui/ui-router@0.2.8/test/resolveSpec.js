describe("resolve", function () {
  
  var $r, tick;

  beforeEach(module('ui.router.util'));
  beforeEach(module(function($provide) {
    $provide.factory('Foo', function() {
      return "Working";
    });
  }));

  beforeEach(inject(function($resolve, $q) {
    $r = $resolve;
    tick = $q.flush;
  }));
  
  describe(".resolve()", function () {
    it("calls injectable functions and returns a promise", function () {
      var fun = jasmine.createSpy('fun').andReturn(42);
      var r = $r.resolve({ fun: [ '$resolve', fun ] });
      expect(r).not.toBeResolved();
      tick();
      expect(resolvedValue(r)).toEqual({ fun: 42 });
      expect(fun).toHaveBeenCalled();
      expect(fun.callCount).toBe(1);
      expect(fun.mostRecentCall.args.length).toBe(1);
      expect(fun.mostRecentCall.args[0]).toBe($r);
    });
    
    it("resolves promises returned from the functions", inject(function ($q) {
      var d = $q.defer();
      var fun = jasmine.createSpy('fun').andReturn(d.promise);
      var r = $r.resolve({ fun: [ '$resolve', fun ] });
      tick();
      expect(r).not.toBeResolved();
      d.resolve('async');
      tick();
      expect(resolvedValue(r)).toEqual({ fun: 'async' });
    }));
    
    it("resolves dependencies between functions", function () {
      var a = jasmine.createSpy('a');
      var b = jasmine.createSpy('b').andReturn('bb');
      var r = $r.resolve({ a: [ 'b', a ], b: [ b ] });
      tick();
      expect(a).toHaveBeenCalled();
      expect(a.mostRecentCall.args).toEqual([ 'bb' ]);
      expect(b).toHaveBeenCalled();
    });
    
    it("resolves dependencies between functions that return promises", inject(function ($q) {
      var ad = $q.defer(), a = jasmine.createSpy('a').andReturn(ad.promise);
      var bd = $q.defer(), b = jasmine.createSpy('b').andReturn(bd.promise);
      var cd = $q.defer(), c = jasmine.createSpy('c').andReturn(cd.promise);
      
      var r = $r.resolve({ a: [ 'b', 'c', a ], b: [ 'c', b ], c: [ c ] });
      tick();
      expect(r).not.toBeResolved();
      expect(a).not.toHaveBeenCalled();
      expect(b).not.toHaveBeenCalled();
      expect(c).toHaveBeenCalled();
      cd.resolve('cc');
      tick();
      expect(r).not.toBeResolved();
      expect(a).not.toHaveBeenCalled();
      expect(b).toHaveBeenCalled();
      expect(b.mostRecentCall.args).toEqual([ 'cc' ]);
      bd.resolve('bb');
      tick();
      expect(r).not.toBeResolved();
      expect(a).toHaveBeenCalled();
      expect(a.mostRecentCall.args).toEqual([ 'bb', 'cc' ]);
      ad.resolve('aa');
      tick();
      expect(resolvedValue(r)).toEqual({ a: 'aa', b: 'bb', c: 'cc' });
      expect(a.callCount).toBe(1);
      expect(b.callCount).toBe(1);
      expect(c.callCount).toBe(1);
    }));
    
    it("refuses cyclic dependencies", function () {
      var a = jasmine.createSpy('a');
      var b = jasmine.createSpy('b');
      expect(caught(function () {
        $r.resolve({ a: [ 'b', a ], b: [ 'a', b ] });
      })).toMatch(/cyclic/i);
      expect(a).not.toHaveBeenCalled();
      expect(b).not.toHaveBeenCalled();
    });
    
    it("allows a function to depend on an injector value of the same name", function () {
      var r = $r.resolve({ $resolve: function($resolve) { return $resolve === $r; } });
      tick();
      expect(resolvedValue(r)).toEqual({ $resolve: true });
    });
    
    it("allows locals to be passed that override the injector", function () {
      var fun = jasmine.createSpy('fun');
      $r.resolve({ fun: [ '$resolve', fun ] }, { $resolve: 42 });
      tick();
      expect(fun).toHaveBeenCalled();
      expect(fun.mostRecentCall.args[0]).toBe(42);
    });
    
    it("does not call injectables overridden by a local", function () {
      var fun = jasmine.createSpy('fun').andReturn("function");
      var r = $r.resolve({ fun: [ fun ] }, { fun: "local" });
      tick();
      expect(fun).not.toHaveBeenCalled();
      expect(resolvedValue(r)).toEqual({ fun: "local" });
    });
    
    it("includes locals in the returned values", function () {
      var locals = { foo: 'hi', bar: 'mom' };
      var r = $r.resolve({}, locals);
      tick();
      expect(resolvedValue(r)).toEqual(locals);
    });
    
    it("allows inheritance from a parent resolve()", function () {
      var r = $r.resolve({ fun: function () { return true; } });
      var s = $r.resolve({ games: function () { return true; } }, r);
      tick();
      expect(r).toBeResolved();
      expect(resolvedValue(s)).toEqual({ fun: true, games: true });
    });
    
    it("only accepts promises from $resolve as parent", inject(function ($q) {
      expect(caught(function () {
        $r.resolve({}, null, $q.defer().promise);
      })).toMatch(/\$resolve\.resolve/);
    }));
    
    it("resolves dependencies from a parent resolve()", function () {
      var r = $r.resolve({ a: [ function() { return 'aa' } ] });
      var b = jasmine.createSpy('b');
      var s = $r.resolve({ b: [ 'a', b ] }, r);
      tick();
      expect(b).toHaveBeenCalled();
      expect(b.mostRecentCall.args).toEqual([ 'aa' ]);
    });
    
    it("allows a function to override a parent value of the same name", function () {
      var r = $r.resolve({ b: function() { return 'B' } });
      var s = $r.resolve({
        a: function (b) { return 'a:' + b },
        b: function (b) { return '(' + b + ')' },
        c: function (b) { return 'c:' + b }
      }, r);
      tick();
      expect(resolvedValue(s)).toEqual({ a: 'a:(B)', b:'(B)', c:'c:(B)' });
    });
    
    it("allows a function to override a parent value of the same name with a promise", inject(function ($q) {
      var r = $r.resolve({ b: function() { return 'B' } });
      var superb, bd = $q.defer();
      var s = $r.resolve({
        a: function (b) { return 'a:' + b },
        b: function (b) { superb = b; return bd.promise },
        c: function (b) { return 'c:' + b }
      }, r);
      tick();
      bd.resolve('(' + superb + ')');
      tick();
      expect(resolvedValue(s)).toEqual({ a: 'a:(B)', b:'(B)', c:'c:(B)' });
    }));

    it("it only resolves after the parent resolves", inject(function ($q) {
      var bd = $q.defer(), b = jasmine.createSpy('b').andReturn(bd.promise);
      var cd = $q.defer(), c = jasmine.createSpy('c').andReturn(cd.promise);
      var r = $r.resolve({ c: [ c ] });
      var s = $r.resolve({ b: [ b ] }, r);
      bd.resolve('bbb');
      tick();
      expect(r).not.toBeResolved();
      expect(s).not.toBeResolved();
      cd.resolve('ccc');
      tick();
      expect(resolvedValue(r)).toEqual({ c: 'ccc' });
      expect(resolvedValue(s)).toEqual({ b: 'bbb', c: 'ccc' });
    }));

    it("invokes functions as soon as possible", inject(function ($q) {
      var ad = $q.defer(), a = jasmine.createSpy('a').andReturn(ad.promise);
      var bd = $q.defer(), b = jasmine.createSpy('b').andReturn(bd.promise);
      var cd = $q.defer(), c = jasmine.createSpy('c').andReturn(cd.promise);
      
      var r = $r.resolve({ c: [ c ] });
      var s = $r.resolve({ a: [ a ], b: [ 'c', b ] }, r);
      expect(c).toHaveBeenCalled(); // synchronously
      expect(a).toHaveBeenCalled(); // synchronously
      expect(r).not.toBeResolved();
      expect(s).not.toBeResolved();
      cd.resolve('ccc');
      tick();
      expect(b).toHaveBeenCalled();
      expect(b.mostRecentCall.args).toEqual([ 'ccc' ]);
    }));
        
    it("passes the specified 'self' argument as 'this'", function () {
      var self = {}, passed;
      $r.resolve({ fun: function () { passed = this; } }, null, null, self);
      tick();
      expect(passed).toBe(self);
    });
    
    it("rejects missing dependencies but does not fail synchronously", function () {
      var r = $r.resolve({ fun: function (invalid) {} });
      expect(r).not.toBeResolved();
      tick();
      expect(resolvedError(r)).toMatch(/unknown provider/i);
    });
    
    it("propagates exceptions thrown by the functions as a rejection", function () {
      var r = $r.resolve({ fun: function () { throw "i want cake" } });
      expect(r).not.toBeResolved();
      tick();
      expect(resolvedError(r)).toBe("i want cake");
    });
    
    it("propagates errors from a parent resolve", function () {
      var error = [ "the cake is a lie" ];
      var r = $r.resolve({ foo: function () { throw error } });
      var s = $r.resolve({ bar: function () { 42 } }, r);
      tick();
      expect(resolvedError(r)).toBe(error);
      expect(resolvedError(s)).toBe(error);
    });
    
    it("does not invoke any functions if the parent resolve has already failed", function () {
      var r = $r.resolve({ foo: function () { throw "oops" } });
      tick();
      expect(r).toBeResolved();
      var a = jasmine.createSpy('a');
      var s =  $r.resolve({ a: [ a ] }, r);
      tick();
      expect(resolvedError(s)).toBeDefined();
      expect(a).not.toHaveBeenCalled();
    });
    
    it("does not invoke any more functions after a failure", inject(function ($q) {
      var ad = $q.defer(), a = jasmine.createSpy('a').andReturn(ad.promise);
      var cd = $q.defer(), c = jasmine.createSpy('c').andReturn(cd.promise);
      var dd = $q.defer(), d = jasmine.createSpy('d').andReturn(dd.promise);
      var r = $r.resolve({ a: [ 'c', a ], c: [ c ], d: [ d ] });
      dd.reject('dontlikeit');
      tick();
      expect(resolvedError(r)).toBeDefined();
      cd.resolve('ccc');
      tick();
      expect(a).not.toHaveBeenCalled();
    }));
    
    it("does not invoke any more functions after a parent failure", inject(function ($q) {
      var ad = $q.defer(), a = jasmine.createSpy('a').andReturn(ad.promise);
      var cd = $q.defer(), c = jasmine.createSpy('c').andReturn(cd.promise);
      var dd = $q.defer(), d = jasmine.createSpy('d').andReturn(dd.promise);
      var r = $r.resolve({ c: [ c ], d: [ d ] });
      var s = $r.resolve({ a: [ 'c', a ] }, r);
      dd.reject('dontlikeit');
      tick();
      expect(resolvedError(r)).toBeDefined();
      expect(resolvedError(s)).toBeDefined();
      cd.resolve('ccc');
      tick();
      expect(a).not.toHaveBeenCalled();
    }));
  });
  
  describe(".study()", function () {
    it("returns a resolver function", function () {
      expect(typeof $r.study({})).toBe('function');
    });
    
    it("refuses cyclic dependencies", function () {
      var a = jasmine.createSpy('a');
      var b = jasmine.createSpy('b');
      expect(caught(function () {
        $r.study({ a: [ 'b', a ], b: [ 'a', b ] });
      })).toMatch(/cyclic/i);
      expect(a).not.toHaveBeenCalled();
      expect(b).not.toHaveBeenCalled();
    });
    
    it("does not call the injectables", function () {
      var a = jasmine.createSpy('a');
      var b = jasmine.createSpy('b');
      $r.study({ a: [ 'b', a ], b: [ b ] });
      expect(a).not.toHaveBeenCalled();
      expect(b).not.toHaveBeenCalled();
    });

    it("returns a function that can be used multiple times", function () {
      var trace = [];
      var r = $r.study({ a: [ 'what', function (what) { trace.push("a: " + what) } ] });
      r({ what: '1' });
      expect(trace).toEqual([ 'a: 1' ]);
      r({ what: 'hi' });
      expect(trace).toEqual([ 'a: 1', 'a: hi' ]);
    });

    it("resolves values from string factory names", function () {
      var result, r = $r.study({ foo: "Foo" })().then(function(values) {
        result = values['foo'];
      });
      tick();

      expect(result).toBe("Working");
    });
  });
});

