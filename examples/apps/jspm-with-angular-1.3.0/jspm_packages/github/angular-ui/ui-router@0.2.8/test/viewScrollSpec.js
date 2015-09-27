describe('uiView', function () {
  'use strict';

  beforeEach(module('ui.router'));

  describe('scrollIntoView', function () {
    var elem;

    beforeEach(function () {
      elem = [{ scrollIntoView: jasmine.createSpy('scrollIntoView') }];
    });

    it('should scroll element into view after timeout', inject(function ($uiViewScroll, $timeout) {
      $uiViewScroll(elem);
      expect(elem[0].scrollIntoView).not.toHaveBeenCalled();

      $timeout.flush();
      expect(elem[0].scrollIntoView).toHaveBeenCalled();
    }));
  });

  describe('useAnchorScroll', function () {
    beforeEach(module(function ($provide, $uiViewScrollProvider) {
      $provide.decorator('$anchorScroll', function ($delegate) {
        return jasmine.createSpy('$anchorScroll');
      });
      $uiViewScrollProvider.useAnchorScroll();
    }));

    it('should call $anchorScroll', inject(function ($uiViewScroll, $anchorScroll) {
      $uiViewScroll();
      expect($anchorScroll).toHaveBeenCalled();
    }));
  });
});
