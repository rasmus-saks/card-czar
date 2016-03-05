/**
 * Created by AlWilliam on 3/5/2016.
 */
angular.module('CardCzar.filters', []).
  filter('interpolate', ['version', function(version) {
    return function(text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    }
  }]);