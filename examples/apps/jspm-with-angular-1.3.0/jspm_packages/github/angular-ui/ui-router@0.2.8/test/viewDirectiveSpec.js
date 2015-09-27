/*jshint browser: true, indent: 2 */
/*global describe: false, it: false, beforeEach: false, expect: false, resolvedValue: false, module: false, inject: false, angular: false */

describe('uiView', function () {
  'use strict';

  var scope, $compile, elem;

  beforeEach(function() {
    var depends = ['ui.router'];

    try {
      angular.module('ngAnimate');
      depends.push('ngAnimate');
    } catch(e) {
      angular.module('mock.animate', []).value('$animate', null);
    }

    angular.module('ui.router.test', depends);
    module('ui.router.test');
    module('mock.animate');
  });

  beforeEach(module(function ($provide) {
    $provide.decorator('$uiViewScroll', function ($delegate) {
      return jasmine.createSpy('$uiViewScroll');
    });
  }));

  var aState = {
    template: 'aState template'
  },
  bState = {
    template: 'bState template'
  },
  cState = {
    views: {
      'cview': {
        template: 'cState cview template'
      }
    }
  },
  dState = {
    views: {
      'dview1': {
        template: 'dState dview1 template'
      },
      'dview2': {
        template: 'dState dview2 template'
      }
    }
  },
  eState = {
    template: '<div ui-view="eview" class="eview"></div>'
  },
  fState = {
    views: {
      'eview': {
        template: 'fState eview template'
      }
    }
  },
  gState = {
    template: '<div ui-view="inner"><span ng-class="{ test: true }">{{content}}</span></div>'
  },
  hState = {
    views: {
      'inner': {
        template: 'hState inner template'
      }
    }
  },
  iState = {
    template: '<div ui-view>'+
        '<ul><li ng-repeat="item in items">{{item}}</li></ul>'+
      '</div>'
  },
  jState = {
    template: '<span ng-class="test">jState</span>'
  };

  beforeEach(module(function ($stateProvider) {
    $stateProvider
      .state('a', aState)
      .state('b', bState)
      .state('c', cState)
      .state('d', dState)
      .state('e', eState)
      .state('e.f', fState)
      .state('g', gState)
      .state('g.h', hState)
      .state('i', iState)
      .state('j', jState);
  }));

  beforeEach(inject(function ($rootScope, _$compile_) {
    scope = $rootScope.$new();
    $compile = _$compile_;
    elem = angular.element('<div>');
  }));

  describe('linking ui-directive', function () {

    it('anonymous ui-view should be replaced with the template of the current $state', inject(function ($state, $q, $animate) {
      elem.append($compile('<div><ui-view></ui-view></div>')(scope));

      $state.transitionTo(aState);
      $q.flush();

      if ($animate) {
        expect($animate.flushNext('leave').element.text()).toBe('');
        expect($animate.flushNext('enter').element.text()).toBe(aState.template);
      }
    }));

    it('named ui-view should be replaced with the template of the current $state', inject(function ($state, $q, $animate) {
      elem.append($compile('<div><ui-view name="cview"></ui-view></div>')(scope));

      $state.transitionTo(cState);
      $q.flush();

      if ($animate) {
        expect($animate.flushNext('leave').element.text()).toBe('');
        expect($animate.flushNext('enter').element.text()).toBe(cState.views.cview.template);
      }
    }));

    it('ui-view should be updated after transition to another state', inject(function ($state, $q, $animate) {
      elem.append($compile('<div><ui-view></ui-view></div>')(scope));

      $state.transitionTo(aState);
      $q.flush();

      if ($animate) {
        expect($animate.flushNext('leave').element.text()).toBe('');
        expect($animate.flushNext('enter').element.text()).toBe(aState.template);
      }

      $state.transitionTo(bState);
      $q.flush();

      if ($animate) {
        expect($animate.flushNext('leave').element.text()).toBe(aState.template);
        expect($animate.flushNext('enter').element.text()).toBe(bState.template);
      }
    }));

    it('should handle NOT nested ui-views', inject(function ($state, $q, $animate) {
      elem.append($compile('<div><div ui-view="dview1" class="dview1"></div><div ui-view="dview2" class="dview2"></div></div>')(scope));

      $state.transitionTo(dState);
      $q.flush();

      if ($animate) {
        expect($animate.flushNext('leave').element.html()).toBe('');
        expect($animate.flushNext('enter').element.text()).toBe(dState.views.dview1.template);
        expect($animate.flushNext('leave').element.html()).toBe('');
        expect($animate.flushNext('enter').element.text()).toBe(dState.views.dview2.template);
      }
    }));

    it('should handle nested ui-views (testing two levels deep)', inject(function ($state, $q, $animate) {
      $compile(elem.append('<div ui-view class="view"></div>'))(scope);

      $state.transitionTo(fState);
      $q.flush();

      if ($animate) {
        expect($animate.flushNext('leave').element.text()).toBe('');
        expect($animate.flushNext('enter').element.parent().find('.view')).toMatchText('');

        var target = $animate.flushNext('enter').element;
        expect(target).toHaveClass('eview');
        expect(target).toMatchText(fState.views.eview.template);
      }
    }));
  });

  describe('handling initial view', function () {
    it('initial view should be compiled if the view is empty', inject(function ($state, $q, $animate) {
      var content = 'inner content';
      elem.append($compile('<div><ui-view></ui-view></div')(scope));
      scope.$apply('content = "' + content + '"');

      $state.transitionTo(gState);
      $q.flush();

      if ($animate) {
        var target = $animate.flushNext('leave').element;
        expect(target.text()).toBe("");

        $animate.flushNext('enter');
        $animate.flushNext('leave');
        $animate.flushNext('enter');
        $animate.flushNext('addClass');
        $animate.flushNext('addClass');

        target = $animate.flushNext('addClass').element;
        expect(target).toHaveClass('test');
        expect(target.text()).toBe(content);
      }
    }));

    it('initial view should be put back after removal of the view', inject(function ($state, $q, $animate) {
      var content = 'inner content';

      elem.append($compile('<div><ui-view></ui-view></div>')(scope));
      scope.$apply('content = "' + content + '"');

      $state.transitionTo(hState);
      $q.flush();

      if ($animate) {
        expect($animate.flushNext('leave').element.text()).toBe('');
        expect($animate.flushNext('enter').element.text()).toBe('');
        expect($animate.flushNext('enter').element.text()).toBe(hState.views.inner.template);
        expect($animate.flushNext('addClass').element.text()).toBe(content);

        // going to the parent state which makes the inner view empty
        $state.transitionTo(gState);
        $q.flush();

        expect($animate.flushNext('leave').element).toMatchText(hState.views.inner.template);
        $animate.flushNext('enter');

        var target = $animate.flushNext('addClass').element;
        expect(target).toHaveClass('test');
        expect(target).toMatchText(content);
      }
    }));

    // related to issue #435
    it('initial view should be transcluded once to prevent breaking other directives', inject(function ($state, $q, $animate) {
      scope.items = ["I", "am", "a", "list", "of", "items"];

      elem.append($compile('<div><ui-view></ui-view></div>')(scope));

      // transition to state that has an initial view
      $state.transitionTo(iState);
      $q.flush();
      if ($animate) $animate.flush();

      // verify if ng-repeat has been compiled
      expect(elem.find('li').length).toBe(scope.items.length);

      // transition to another state that replace the initial content
      $state.transitionTo(jState);
      $q.flush();
      if ($animate) $animate.flush();

      expect(elem.find('ui-view').find('span').text()).toBe('jState');

      // transition back to the state with empty subview and the initial view
      $state.transitionTo(iState);
      $q.flush();
      if ($animate) $animate.flush();

      // verify if the initial view is correct
      expect(elem.find('li').length).toBe(scope.items.length);

      // change scope properties
      scope.$apply(function () {
        scope.items.push(".", "Working?");
      });

      if ($animate) $animate.flush();

      // verify if the initial view has been updated
      expect(elem.find('li').length).toBe(scope.items.length);
    }));
  });

  describe('autoscroll attribute', function () {
    it('should autoscroll when unspecified', inject(function ($state, $q, $uiViewScroll, $animate) {
      elem.append($compile('<div><ui-view></ui-view></div>')(scope));
      $state.transitionTo(aState);
      $q.flush();
      if ($animate) $animate.flush();
      expect($uiViewScroll).toHaveBeenCalledWith(elem.find('span').parent());
    }));

    it('should autoscroll when expression is missing', inject(function ($state, $q, $uiViewScroll, $animate) {
      elem.append($compile('<div><ui-view autoscroll></ui-view></div>')(scope));
      $state.transitionTo(aState);
      $q.flush();
      if ($animate) $animate.flush();
      expect($uiViewScroll).toHaveBeenCalledWith(elem.find('span').parent());
    }));

    it('should autoscroll based on expression', inject(function ($state, $q, $uiViewScroll, $animate) {
      elem.append($compile('<div><ui-view autoscroll="doScroll"></ui-view></div>')(scope));

      scope.doScroll = false;
      $state.transitionTo(aState);
      $q.flush();
      expect($uiViewScroll).not.toHaveBeenCalled();

      scope.doScroll = true;
      $state.transitionTo(bState);
      $q.flush();
      if ($animate) $animate.flush();

      var target;
      angular.forEach(elem.find('ui-view'), function(view) {
        if (angular.element(view).text() === bState.template) target = angular.element(view);
      });

      expect($uiViewScroll).toHaveBeenCalledWith(target);
    }));
  });

});