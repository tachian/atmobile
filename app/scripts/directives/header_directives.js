'use strict';

/* Directives */

angular.module('headerDirectives', [])
.directive('tlpBack', function () {
    return {
      restrict : 'A',

      link: function(scope, element, attrs) {
        element.on('click', function() {
           window.history.back();
        });
      }
    };
});
