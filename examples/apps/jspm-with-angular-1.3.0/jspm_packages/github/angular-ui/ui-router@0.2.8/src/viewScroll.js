/**
 * @ngdoc object
 * @name ui.router.state.$uiViewScroll
 *
 * @requires $anchorScroll
 * @requires $timeout
 *
 * @description
 * When called with a jqLite element, it scrolls the element into view (after a
 * `$timeout` so the DOM has time to refresh).
 *
 * If you prefer to rely on `$anchorScroll` to scroll the view to the anchor,
 * this can be enabled by calling `$uiViewScrollProvider.useAnchorScroll()`.
 */
function $ViewScrollProvider() {

  var useAnchorScroll = false;

  this.useAnchorScroll = function () {
    useAnchorScroll = true;
  };

  this.$get = ['$anchorScroll', '$timeout', function ($anchorScroll, $timeout) {
    if (useAnchorScroll) {
      return $anchorScroll;
    }

    return function ($element) {
      $timeout(function () {
        $element[0].scrollIntoView();
      }, 0, false);
    };
  }];
}

angular.module('ui.router.state').provider('$uiViewScroll', $ViewScrollProvider);
