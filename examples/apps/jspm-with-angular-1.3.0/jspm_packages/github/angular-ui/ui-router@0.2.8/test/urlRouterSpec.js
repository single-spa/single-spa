describe("UrlRouter", function () {

  var $urp, $ur, location, match, scope;

  beforeEach(function() {
    angular.module('ui.router.router.test', function() {}).config(function ($urlRouterProvider) {
      $urp = $urlRouterProvider;

      $urp.rule(function ($injector, $location) {
        var path = $location.path();
        if (!/baz/.test(path)) return false;
        return path.replace('baz', 'b4z');
      }).when('/foo/:param', function($match) {
        match = ['/foo/:param', $match];
      }).when('/bar', function($match) {
        match = ['/bar', $match];
      });
    });

    module('ui.router.router', 'ui.router.router.test');

    inject(function($rootScope, $location, $injector) {
      scope = $rootScope.$new();
      location = $location;
      $ur = $injector.invoke($urp.$get);
    });
  });

  describe("provider", function () {

    it("should throw on non-function rules", function () {
      expect(function() { $urp.rule(null); }).toThrow("'rule' must be a function")
      expect(function() { $urp.otherwise(null); }).toThrow("'rule' must be a function")
    });

  });

  describe("service", function() {
    it("should execute rewrite rules", function () {
      location.path("/foo");
      scope.$emit("$locationChangeSuccess");
      expect(location.path()).toBe("/foo");

      location.path("/baz");
      scope.$emit("$locationChangeSuccess");
      expect(location.path()).toBe("/b4z");
    });

    it("should keep otherwise last", function () {
      $urp.otherwise('/otherwise');

      location.path("/lastrule");
      scope.$emit("$locationChangeSuccess");
      expect(location.path()).toBe("/otherwise");

      $urp.when('/lastrule', function($match) {
        match = ['/lastrule', $match];
      });

      location.path("/lastrule");
      scope.$emit("$locationChangeSuccess");
      expect(location.path()).toBe("/lastrule");
    });

    it("should allow custom URL matchers", function () {
      var custom = {
        url: { exec: function() {}, format: function() {}, concat: function() {} },
        handler: function() {}
      };

      spyOn(custom.url, "exec").andReturn({});
      spyOn(custom.url, "format").andReturn("/foo-bar");
      spyOn(custom, "handler").andReturn(true);

      $urp.when(custom.url, custom.handler);
      scope.$broadcast("$locationChangeSuccess");
      scope.$apply();

      expect(custom.url.exec).toHaveBeenCalled();
      expect(custom.url.format).not.toHaveBeenCalled();
      expect(custom.handler).toHaveBeenCalled();
    });

    it('can be cancelled by preventDefault() in $locationChangeSuccess', inject(function () {
      var called;
      location.path("/baz");
      scope.$on('$locationChangeSuccess', function (ev) {
        ev.preventDefault();
        called = true;
      });
      scope.$emit("$locationChangeSuccess");
      expect(called).toBeTruthy();
      expect(location.path()).toBe("/baz");
    }));

    it('can be deferred and updated in $locationChangeSuccess', inject(function ($urlRouter, $timeout) {
      var called;
      location.path("/baz");
      scope.$on('$locationChangeSuccess', function (ev) {
        ev.preventDefault();
        called = true;
        $timeout($urlRouter.sync, 2000);
      });
      scope.$emit("$locationChangeSuccess");
      $timeout.flush();
      expect(called).toBeTruthy();
      expect(location.path()).toBe("/b4z");
    }));
  });

});